
import { calculateStringSimilarity, calculateNameSimilarity } from "@/utils/stringSimilarity";
import { compareAddresses } from "@/utils/addressNormalization";
import { compareStates } from "@/utils/stateNormalization";
import { REVIEW_SEARCH_CONFIG } from "./reviewSearchConfig";
import { ReviewData } from "./types";
import { validateFieldCombination } from "./fieldCombinationRules";
import { areCitiesInProximity, calculateProximityScore } from "@/utils/cityProximity";

interface ScoredReview extends ReviewData {
  searchScore: number;
  matchCount: number;
  completenessScore: number;
  exactFieldMatches: number;
  exactMatchDetails: Array<{
    field: string;
    isExact: boolean;
  }>;
  detailedMatches: Array<{
    field: string;
    reviewValue: string;
    searchValue: string;
    similarity: number;
    matchType: 'exact' | 'partial' | 'fuzzy' | 'proximity';
  }>;
}

// Calculate how complete the customer information is
const calculateCompletenessScore = (review: ReviewData): number => {
  let completeness = 0;
  const fields = [
    review.customer_name,
    review.customer_phone,
    review.customer_address,
    review.customer_city,
    review.customer_zipcode
  ];
  
  fields.forEach(field => {
    if (field && field.trim() !== '') {
      completeness += 20; // Each field worth 20 points for 100% completeness
    }
  });
  
  return completeness;
};

// Helper function to detect search context
const detectSearchContext = (searchParams: {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}) => {
  const hasName = Boolean(searchParams.firstName || searchParams.lastName);
  const hasLocation = Boolean(searchParams.address || searchParams.city || searchParams.zipCode);
  const hasPhone = Boolean(searchParams.phone);
  const hasAddress = Boolean(searchParams.address);
  
  return {
    hasName,
    hasLocation,
    hasPhone,
    hasAddress,
    isNameFocused: hasName && (hasLocation || hasPhone),
    isLocationOnly: !hasName && !hasPhone && hasLocation,
    isPhoneOnly: !hasName && hasPhone && !hasLocation,
    isPhoneWithLocation: !hasName && hasPhone && hasLocation,
    isAddressWithState: !hasName && !hasPhone && hasAddress && searchParams.state
  };
};

export const scoreReview = async (
  review: ReviewData,
  searchParams: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  },
  businessState?: string | null
): Promise<ScoredReview> => {
  const { firstName, lastName, phone, address, city, state, zipCode } = searchParams;
  const searchContext = detectSearchContext(searchParams);
  
  let score = 0;
  let matches = 0;
  let exactFieldMatches = 0;
  
  // Declare match tracking variables early
  let phoneMatched = false;
  let cityMatched = false;
  let zipMatched = false;
  
  const exactMatchDetails: Array<{
    field: string;
    isExact: boolean;
  }> = [];
  const detailedMatches: Array<{
    field: string;
    reviewValue: string;
    searchValue: string;
    similarity: number;
    matchType: 'exact' | 'partial' | 'fuzzy' | 'proximity';
  }> = [];

  // Calculate completeness score for this review
  const completenessScore = calculateCompletenessScore(review);

  // Clean phone and zip for comparison
  const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
  const cleanZip = zipCode ? zipCode.replace(/\D/g, '') : '';

  // Validate field combination before scoring
  const fieldValidation = validateFieldCombination(searchParams, {
    customer_name: review.customer_name,
    customer_phone: review.customer_phone,
    customer_address: review.customer_address,
    customer_city: review.customer_city,
    customer_zipcode: review.customer_zipcode,
    business_state: businessState || undefined
  });

  // Early exit if field combination is invalid
  if (!fieldValidation.isValid) {
    console.log(`[FIELD_VALIDATION] Review ${review.id} rejected by field combination rules: ${fieldValidation.appliedRules.join(', ')}`);
    return { 
      ...review, 
      searchScore: 0, 
      matchCount: 0,
      completenessScore,
      exactFieldMatches: 0,
      exactMatchDetails: [],
      detailedMatches: []
    };
  }

  // Enhanced validation for multi-field searches - reject weak combinations early
  const isNamePhoneSearch = (firstName || lastName) && phone;
  let nameMatchFound = false;
  let phoneMatchFound = false;
  
  // Pre-validate name match for name+phone searches
  if (isNamePhoneSearch && review.customer_name) {
    let totalNameSimilarity = 0;
    let nameCount = 0;
    
    if (firstName) {
      const firstNameSim = calculateNameSimilarity(firstName, review.customer_name);
      console.log(`[NAME_VALIDATION] First name: "${firstName}" vs "${review.customer_name}" = ${firstNameSim.toFixed(3)}`);
      totalNameSimilarity += firstNameSim;
      nameCount++;
    }
    
    if (lastName) {
      const lastNameSim = calculateNameSimilarity(lastName, review.customer_name);
      console.log(`[NAME_VALIDATION] Last name: "${lastName}" vs "${review.customer_name}" = ${lastNameSim.toFixed(3)}`);
      totalNameSimilarity += lastNameSim;
      nameCount++;
    }
    
    const avgNameSimilarity = nameCount > 0 ? totalNameSimilarity / nameCount : 0;
    nameMatchFound = avgNameSimilarity >= 0.6; // Stricter threshold for combined searches
  }
  
  // Pre-validate phone match for name+phone searches  
  if (isNamePhoneSearch && review.customer_phone) {
    const reviewPhone = review.customer_phone.replace(/\D/g, '');
    const searchPhone = cleanPhone;
    
    // Require exact match or 7+ digit match (not just area code)
    if (reviewPhone === searchPhone) {
      phoneMatchFound = true;
    } else if (searchPhone.length >= 7 && reviewPhone.length >= 7) {
      const searchLast7 = searchPhone.slice(-7);
      const reviewLast7 = reviewPhone.slice(-7);
      phoneMatchFound = searchLast7 === reviewLast7;
    }
  }
  
  // Count non-empty search parameters for dynamic validation
  const searchFieldCount = [firstName, lastName, phone, address, city, state, zipCode]
    .filter(field => field && field.trim().length > 0).length;
  
  console.log(`[FIELD_COUNT] Total search fields: ${searchFieldCount}`);
  
  // Track name validation state with improved component matching
  let nameValidationDeferred = false;
  let nameComponentMatched = false;
  let nameThreshold = 0.5; // Default for 1-3 fields
  
  // Set thresholds based on search comprehensiveness
  if (searchFieldCount >= 6) {
    nameThreshold = 0.2; // Very permissive for comprehensive searches
    nameValidationDeferred = true;
  } else if (searchFieldCount >= 5) {
    nameThreshold = 0.25;
    nameValidationDeferred = true;
  } else if (searchFieldCount >= 4) {
    nameThreshold = 0.3;
  }
  
  // Store name validation results with improved individual component validation
  if ((firstName || lastName) && review.customer_name) {
    console.log(`[NAME_DEBUG] Review ${review.id} (${review.customer_name})`);
    console.log(`[NAME_DEBUG] Search: firstName="${firstName}", lastName="${lastName}"`);
    console.log(`[NAME_DEBUG] Using name threshold: ${nameThreshold} (based on ${searchFieldCount} fields)`);
    
    let bestFirstNameSimilarity = 0;
    let bestLastNameSimilarity = 0;
    
    if (firstName) {
      bestFirstNameSimilarity = calculateNameSimilarity(firstName, review.customer_name);
      console.log(`[NAME_DEBUG] First name similarity: "${firstName}" vs "${review.customer_name}" = ${bestFirstNameSimilarity}`);
    }
    
    if (lastName) {
      bestLastNameSimilarity = calculateNameSimilarity(lastName, review.customer_name);
      console.log(`[NAME_DEBUG] Last name similarity: "${lastName}" vs "${review.customer_name}" = ${bestLastNameSimilarity}`);
    }
    
    // Improved component validation logic for nickname matches
    if (firstName && lastName) {
      // For both first and last name searches, use flexible component matching
      // Allow matches where one component is strong (≥0.8) and other is moderate (≥0.4)
      // OR where both components are reasonably good (≥0.6)
      const hasStrongComponent = bestFirstNameSimilarity >= 0.8 || bestLastNameSimilarity >= 0.8;
      const hasModerateComponent = bestFirstNameSimilarity >= 0.4 && bestLastNameSimilarity >= 0.4;
      const hasBothGoodComponents = bestFirstNameSimilarity >= 0.6 && bestLastNameSimilarity >= 0.6;
      
      nameComponentMatched = (hasStrongComponent && hasModerateComponent) || hasBothGoodComponents;
      console.log(`[NAME_DEBUG] Component analysis: strong=${hasStrongComponent}, moderate=${hasModerateComponent}, bothGood=${hasBothGoodComponents}`);
    } else {
      // For single component searches, use the original threshold
      nameComponentMatched = (bestFirstNameSimilarity >= nameThreshold) || (bestLastNameSimilarity >= nameThreshold);
    }
    
    console.log(`[NAME_DEBUG] Name component matched: ${nameComponentMatched} (first=${bestFirstNameSimilarity}, last=${bestLastNameSimilarity})`);
    console.log(`[NAME_DEBUG] Validation deferred: ${nameValidationDeferred}`);
    
    // Only reject immediately for simpler searches
    if (!nameComponentMatched && !nameValidationDeferred) {
      console.log(`[NAME_VALIDATION] Review ${review.id} REJECTED - No name component similarity meets criteria`);
      console.log(`[NAME_VALIDATION] Best similarities: first=${bestFirstNameSimilarity}, last=${bestLastNameSimilarity}`);
      return { 
        ...review, 
        searchScore: 0, 
        matchCount: 0,
        completenessScore,
        exactFieldMatches: 0,
        exactMatchDetails: [],
        detailedMatches: []
      };
    }
  }

  // Enhanced name matching with massive weight increase for name importance
  if ((firstName || lastName) && review.customer_name) {
    let bestNameScore = 0;
    let bestSimilarity = 0;
    
    // Test individual name components for better matching
    if (firstName) {
      const firstSim = calculateNameSimilarity(firstName, review.customer_name);
      console.log(`[NAME_SCORING] First name: "${firstName}" vs "${review.customer_name}" = ${firstSim.toFixed(3)}`);
      if (firstSim > bestSimilarity) {
        bestSimilarity = firstSim;
      }
    }
    
    if (lastName) {
      const lastSim = calculateNameSimilarity(lastName, review.customer_name);
      console.log(`[NAME_SCORING] Last name: "${lastName}" vs "${review.customer_name}" = ${lastSim.toFixed(3)}`);
      if (lastSim > bestSimilarity) {
        bestSimilarity = lastSim;
      }
    }
    
    // Full name comparison
    const fullSearchName = [firstName, lastName].filter(Boolean).join(' ');
    const fullSim = calculateStringSimilarity(fullSearchName.toLowerCase(), review.customer_name.toLowerCase());
    console.log(`[NAME_SCORING] Full name: "${fullSearchName}" vs "${review.customer_name}" = ${fullSim.toFixed(3)}`);
    
    // Use the best similarity found
    const finalSimilarity = Math.max(bestSimilarity, fullSim);
    
    // Require much stricter threshold and proper component matching
    if (finalSimilarity >= 0.7) { 
      // Name scoring reduced to allow other fields more weight (40-70% of total possible score)
      let namePoints = 0;
      
      // If both first and last names were provided, validate component matching
      if (firstName && lastName) {
        const fullSearchName = `${firstName} ${lastName}`;
        const componentSimilarity = calculateNameSimilarity(fullSearchName, review.customer_name);
        
        // For first+last searches, use component-specific matching
        if (componentSimilarity >= 0.7) {
          if (componentSimilarity >= 0.9) {
            namePoints = 70; // Reduced from 100 - Excellent component match
          } else if (componentSimilarity >= 0.8) {
            namePoints = 55; // Reduced from 80 - Very good component match
          } else {
            namePoints = 40; // Reduced from 60 - Good component match
          }
        } else if (searchFieldCount >= 5 && exactFieldMatches >= 3) {
          // For comprehensive searches with multiple exact matches, allow weaker name matching
          namePoints = 25; // Partial name credit for comprehensive searches
          console.log(`[NAME_COMPREHENSIVE] Allowing weak name match due to comprehensive search with ${exactFieldMatches} exact matches`);
        } else {
          // Component matching failed - reject for simpler searches
          console.log(`[NAME_COMPONENT_FAIL] Component matching failed for "${fullSearchName}" vs "${review.customer_name}" (similarity: ${componentSimilarity})`);
          return { 
            ...review, 
            searchScore: 0, 
            matchCount: 0,
            completenessScore,
            exactFieldMatches: 0,
            exactMatchDetails: [],
            detailedMatches: []
          };
        }
      } else {
        // Single name component searches use regular similarity
        if (finalSimilarity >= 0.9) {
          namePoints = 55; // Reduced from 80 - Excellent single component match
        } else if (finalSimilarity >= 0.8) {
          namePoints = 42; // Reduced from 60 - Very good single component match
        } else {
          namePoints = 28; // Reduced from 40 - Good single component match
        }
      }
      
      // Context-aware bonus for name-focused searches
      if (searchContext.isNameFocused) {
        namePoints *= 1.2; // Additional 20% for name-focused searches
      }
      
      score += namePoints;
      matches++;
      
      // Check for exact name match
      const isExactNameMatch = finalSimilarity >= 0.8;
      if (isExactNameMatch) {
        exactFieldMatches++;
        exactMatchDetails.push({ field: 'name', isExact: true });
      }
      
      console.log(`[NAME_SCORING] Review ${review.id} name score: ${namePoints.toFixed(1)} (similarity: ${finalSimilarity.toFixed(3)})`);
      
      detailedMatches.push({
        field: 'Name',
        reviewValue: review.customer_name,
        searchValue: fullSearchName,
        similarity: finalSimilarity,
        matchType: finalSimilarity >= 0.8 ? 'exact' : finalSimilarity >= 0.6 ? 'partial' : 'fuzzy'
      });
    }
    
    // Word-by-word matching with position awareness
    const searchWords = fullSearchName.toLowerCase().split(/\s+/);
    const nameWords = review.customer_name.toLowerCase().split(/\s+/);
    
    for (let i = 0; i < searchWords.length; i++) {
      const searchWord = searchWords[i];
      if (searchWord.length >= REVIEW_SEARCH_CONFIG.MIN_WORD_LENGTH) {
        for (let j = 0; j < nameWords.length; j++) {
          const nameWord = nameWords[j];
          
          // Exact word match
          if (nameWord === searchWord) {
            score += REVIEW_SEARCH_CONFIG.SCORES.WORD_MATCH * 2; // Double points for exact word match
            matches++;
          }
          // Partial word match - more strict criteria
          else if (searchWord.length >= 4 && nameWord.length >= 4 && 
                   (nameWord.includes(searchWord) || searchWord.includes(nameWord))) {
            score += REVIEW_SEARCH_CONFIG.SCORES.WORD_MATCH;
            matches++;
          }
          // Fuzzy word match for similar words
          else {
            const wordSimilarity = calculateStringSimilarity(searchWord, nameWord);
            if (wordSimilarity > 0.8) {
              score += REVIEW_SEARCH_CONFIG.SCORES.WORD_MATCH * wordSimilarity;
              matches++;
            }
          }
        }
      }
    }
  }

  // Enhanced phone matching - much more precise requirements
  if (cleanPhone && review.customer_phone) {
    const reviewPhone = review.customer_phone.replace(/\D/g, '');
    
    // Exact match gets highest priority
    if (reviewPhone === cleanPhone) {
      score += REVIEW_SEARCH_CONFIG.SCORES.PHONE_MATCH * 2;
      matches++;
      exactFieldMatches++;
      exactMatchDetails.push({ field: 'phone', isExact: true });
      phoneMatched = true;
      
      detailedMatches.push({
        field: 'Phone',
        reviewValue: review.customer_phone,
        searchValue: phone || '',
        similarity: 1.0,
        matchType: 'exact'
      });
    }
    // 7+ digit match (not just area code)
    else if (cleanPhone.length >= 7 && reviewPhone.length >= 7) {
      const searchLast7 = cleanPhone.slice(-7);
      const reviewLast7 = reviewPhone.slice(-7);
      if (searchLast7 === reviewLast7) {
        score += REVIEW_SEARCH_CONFIG.SCORES.PHONE_MATCH;
        matches++;
        exactFieldMatches++;
        exactMatchDetails.push({ field: 'phone', isExact: true });
        phoneMatched = true;
        
        detailedMatches.push({
          field: 'Phone',
          reviewValue: review.customer_phone,
          searchValue: phone || '',
          similarity: 0.8,
          matchType: 'partial'
        });
      }
    }
    // Area code only match - very weak, only for single-field searches or with strong other evidence
    else if (cleanPhone.length >= 3 && reviewPhone.length >= 3 && 
             cleanPhone.slice(0, 3) === reviewPhone.slice(0, 3)) {
      // Only allow area code matches if this is NOT a name+phone search OR if name similarity is very high
      if (!isNamePhoneSearch) {
        score += REVIEW_SEARCH_CONFIG.SCORES.PHONE_MATCH * 0.2; // Very low score
        console.log(`⚠️ Area code only match accepted for non-name+phone search: ${cleanPhone.slice(0, 3)}`);
      } else {
        console.log(`❌ Area code only match rejected for name+phone search: ${cleanPhone.slice(0, 3)}`);
      }
    }
  }

  // Enhanced address matching with street number awareness
  let addressScore = 0;
  let addressMatched = false;
  
  if (address && review.customer_address) {
    // Calculate base address similarity
    const addressSimilarity = calculateStringSimilarity(address.toLowerCase(), review.customer_address.toLowerCase());
    
    // Check for high-confidence address match first
    if (compareAddresses(address, review.customer_address, 0.9)) {
      addressScore = REVIEW_SEARCH_CONFIG.SCORES.ADDRESS_SIMILARITY_MULTIPLIER * 1.5;
      addressMatched = true;
      exactFieldMatches++;
      exactMatchDetails.push({ field: 'address', isExact: true });
      
      detailedMatches.push({
        field: 'Address',
        reviewValue: review.customer_address,
        searchValue: address,
        similarity: 0.9,
        matchType: 'exact'
      });
    } 
    // Medium confidence match
    else if (compareAddresses(address, review.customer_address, 0.8)) {
      addressScore = REVIEW_SEARCH_CONFIG.SCORES.ADDRESS_SIMILARITY_MULTIPLIER;
      addressMatched = true;
      exactFieldMatches++;
      exactMatchDetails.push({ field: 'address', isExact: true });
      
      detailedMatches.push({
        field: 'Address',
        reviewValue: review.customer_address,
        searchValue: address,
        similarity: 0.8,
        matchType: 'partial'
      });
    }
    // For address+state searches, require higher similarity threshold
    else if (searchContext.isAddressWithState && addressSimilarity >= 0.6) {
      addressScore = REVIEW_SEARCH_CONFIG.SCORES.ADDRESS_SIMILARITY_MULTIPLIER * 0.8;
      addressMatched = true;
      
      detailedMatches.push({
        field: 'Address',
        reviewValue: review.customer_address,
        searchValue: address,
        similarity: addressSimilarity,
        matchType: 'partial'
      });
    }
    
    // Enhanced word-by-word matching for partial addresses
    const addressWords = address.toLowerCase().split(/\s+/);
    const reviewAddressWords = review.customer_address.toLowerCase().split(/\s+/);
    let hasExactWordMatch = false;
    let bestWordMatchSimilarity = 0;
    
    // Check for street number match (first word often a number)
    const searchNumber = addressWords[0];
    const reviewNumber = reviewAddressWords[0];
    if (searchNumber && reviewNumber && !isNaN(Number(searchNumber)) && searchNumber === reviewNumber) {
      addressScore += REVIEW_SEARCH_CONFIG.SCORES.ADDRESS_WORD_MATCH * 2; // Street number match is very valuable
      addressMatched = true;
      hasExactWordMatch = true;
      bestWordMatchSimilarity = 1.0;
      
      // Count street number match as exact match if the search is just a number
      if (address.trim() === searchNumber && !isNaN(Number(address.trim()))) {
        exactFieldMatches++;
        exactMatchDetails.push({ field: 'address', isExact: true });
        console.log(`[ADDRESS_EXACT] Street number exact match: "${address}" = "${reviewNumber}" (counted as exact)`);
      }
    }
    
    // Check other address components
    for (const word of addressWords) {
      if (word.length >= REVIEW_SEARCH_CONFIG.MIN_WORD_LENGTH) {
        for (const reviewWord of reviewAddressWords) {
          // Exact word match
          if (reviewWord === word) {
            addressScore += REVIEW_SEARCH_CONFIG.SCORES.ADDRESS_WORD_MATCH * 2; // Double for exact
            addressMatched = true;
            hasExactWordMatch = true;
            bestWordMatchSimilarity = Math.max(bestWordMatchSimilarity, 1.0);
            console.log(`[ADDRESS_WORD_EXACT] Exact word match: "${word}" in "${review.customer_address}"`);
          }
          // Partial word match
          else if (reviewWord.includes(word) || word.includes(reviewWord)) {
            addressScore += REVIEW_SEARCH_CONFIG.SCORES.ADDRESS_WORD_MATCH;
            addressMatched = true;
            bestWordMatchSimilarity = Math.max(bestWordMatchSimilarity, 0.7);
          }
        }
      }
    }
    
    // For partial address searches with word matches, add to detailedMatches
    // This is crucial for filtering logic that requires detailedMatches entries
    if (hasExactWordMatch && bestWordMatchSimilarity >= 0.9) {
      // If we haven't already added this address to detailedMatches via similarity
      const existingAddressMatch = detailedMatches.find(match => match.field === 'Address');
      if (!existingAddressMatch) {
        detailedMatches.push({
          field: 'Address',
          reviewValue: review.customer_address,
          searchValue: address,
          similarity: bestWordMatchSimilarity,
          matchType: 'partial'
        });
        console.log(`[ADDRESS_DETAILED] Added exact word match to detailedMatches: similarity=${bestWordMatchSimilarity}`);
      }
    }
    
    // For address+state searches, only add score if address actually matched
    if (searchContext.isAddressWithState) {
      if (addressMatched) {
        score += addressScore;
        matches++;
        console.log(`[ADDRESS_MATCH] Address+State search: added ${addressScore.toFixed(1)} points for "${address}" -> "${review.customer_address}"`);
      } else {
        console.log(`[ADDRESS_NO_MATCH] Address+State search: no address match for "${address}" -> "${review.customer_address}" (similarity: ${addressSimilarity.toFixed(3)})`);
      }
    } else {
      // For non-address-focused searches, always add the score
      score += addressScore;
      if (addressMatched) matches++;
    }
  }

  // Enhanced city matching with fuzzy logic and geographic proximity - CUSTOMER DATA ONLY
  if (city && review.customer_city) {
    const similarity = calculateStringSimilarity(city.toLowerCase(), review.customer_city.toLowerCase());
    let cityMatchedLocal = false;
    let matchType = 'none';
    let points = 0;
    
    // Check string similarity first
    if (similarity > REVIEW_SEARCH_CONFIG.CITY_SIMILARITY_THRESHOLD || 
        review.customer_city.toLowerCase().includes(city.toLowerCase()) || 
        city.toLowerCase().includes(review.customer_city.toLowerCase())) {
      
      points = similarity * REVIEW_SEARCH_CONFIG.SCORES.CITY_SIMILARITY_MULTIPLIER;
      
      // Bonus for exact city match
      if (similarity >= 0.95) {
        points *= 1.3;
        exactFieldMatches++;
        exactMatchDetails.push({ field: 'city', isExact: true });
        console.log(`[CITY_EXACT] Exact city match: "${city}" = "${review.customer_city}"`);
      }
      
      cityMatched = true;
      cityMatchedLocal = true;
      matchType = similarity >= 0.9 ? 'exact' : 'partial';
      
      console.log(`[CITY_MATCH] String match found: "${city}" -> "${review.customer_city}" (similarity: ${similarity.toFixed(2)})`);
    }
    
    // DISABLED: Geographic proximity checks removed to enforce customer-only data matching
    // Geographic proximity was using business state data which caused false positives
    console.log(`[CITY_MATCHING] Only using customer city data: "${review.customer_city}" vs search "${city}"`);
    
    
    if (cityMatchedLocal) {
      score += points;
      matches++;
      
      detailedMatches.push({
        field: 'City',
        reviewValue: review.customer_city,
        searchValue: city,
        similarity: matchType === 'proximity' ? 0.8 : similarity,
        matchType: matchType as 'exact' | 'partial' | 'fuzzy' | 'proximity'
      });
      
      console.log(`[CITY_FINAL] City match added ${points.toFixed(2)} points for "${city}" -> "${review.customer_city}"`);
    } else {
      console.log(`[CITY_NO_MATCH] No match found for "${city}" -> "${review.customer_city}" (similarity: ${similarity.toFixed(2)})`);
      
      // Apply heavy penalty for name + location only searches when city doesn't match
      if (searchContext.hasName && searchContext.hasLocation && 
          !searchContext.hasPhone && !searchContext.hasAddress) {
        score *= 0.1; // Reduce score by 90% for missing city match in location-focused searches
        console.log(`[CITY_PENALTY] Applied heavy city mismatch penalty to review ${review.id} for name+location search`);
      }
    }
  }

  // Enhanced state matching - CUSTOMER DATA ONLY with business fallback
  // Derive customer state from customer location data or use business state as last resort
  let customerState = null;
  
  // Try to extract state from customer zipcode/address or use business state as fallback
  if (review.customer_zipcode && review.customer_zipcode.length >= 5) {
    // For major states with known zip patterns, we could derive state
    // For now, use business state as proxy only if no customer location conflicts
    customerState = businessState;
  } else if (businessState && !review.customer_city) {
    // Only use business state if we have no customer location to contradict it
    customerState = businessState;
  }
  
  console.log(`[STATE_SOURCE] Customer state derived: ${customerState} (from business: ${businessState})`);
  
  if (state && customerState) {
    // Use normalized state comparison to handle CA vs California  
    if (compareStates(state, customerState)) {
      // Give extremely low weight to state matches to prevent weak name matches from passing
      const statePoints = 0.5; // Minimal state bonus
      
      // For address+state searches, only give state points if address also matched
      if (searchContext.isAddressWithState) {
        if (addressMatched) {
          score += statePoints;
          matches++;
          exactFieldMatches++;
          exactMatchDetails.push({ field: 'state', isExact: true });
          console.log(`[STATE_MATCH] Address+State search: minimal state bonus added for "${state}" <-> "${customerState}"`);
        } else {
          console.log(`[STATE_NO_BONUS] Address+State search: no state bonus (address didn't match)`);
        }
      } else {
        // For comprehensive searches (5+ fields), require state match but give minimal weight
        if (searchFieldCount >= 5) {
          score += statePoints;
          matches++;
          exactFieldMatches++;
          exactMatchDetails.push({ field: 'state', isExact: true });
          console.log(`[STATE_MATCH] Comprehensive search: mandatory state match with minimal weight "${state}" <-> "${customerState}"`);
        }
      }
      
      detailedMatches.push({
        field: 'State',
        reviewValue: customerState,
        searchValue: state,
        similarity: 1.0,
        matchType: 'exact'
      });
    } else {
      // State mismatch is now critical for comprehensive searches
      if (searchFieldCount >= 5) {
        console.log(`[STATE_MISMATCH] REJECTING review ${review.id} - State mismatch in comprehensive search: ${state} vs ${customerState}`);
        return { 
          ...review, 
          searchScore: 0, 
          matchCount: 0,
          completenessScore,
          exactFieldMatches: 0,
          exactMatchDetails: [],
          detailedMatches: []
        };
      }
      
      // Apply penalties for location-focused searches
      const hasLocationFocus = Boolean(city || zipCode || address);
      if (hasLocationFocus && !phone && !(firstName && lastName)) {
        // Heavy penalty for location-only searches with wrong state
        score *= 0.1; // Reduce score by 90% (stronger penalty)
        console.log(`[STATE_PENALTY] Applied heavy state mismatch penalty to review ${review.id}: ${state} vs ${customerState}`);
      } else if (hasLocationFocus) {
        // Moderate penalty for mixed searches with wrong state
        score *= 0.5; // Reduce score by 50% (stronger penalty)
        console.log(`[STATE_PENALTY] Applied moderate state mismatch penalty to review ${review.id}: ${state} vs ${customerState}`);
      }
    }
  } else if (state && searchFieldCount >= 5) {
    // For comprehensive searches, lack of customer state data is problematic
    console.log(`[STATE_MISSING] Review ${review.id} lacks customer state data for comprehensive search - penalizing`);
    score *= 0.7; // 30% penalty for missing state data
  }

  // Enhanced zip code matching with context-aware scoring
  if (cleanZip && review.customer_zipcode) {
    const reviewZip = review.customer_zipcode.replace(/\D/g, '');
    
    // Reduce zip scoring weight when name is provided
    let zipMultiplier = searchContext.isNameFocused ? 0.3 : 1.0;
    
    // Exact match gets highest priority
    if (reviewZip === cleanZip) {
      score += REVIEW_SEARCH_CONFIG.SCORES.EXACT_ZIP_MATCH * 1.5 * zipMultiplier;
      matches++;
      exactFieldMatches++;
      exactMatchDetails.push({ field: 'zip', isExact: true });
      zipMatched = true;
      console.log(`[ZIP_EXACT] Exact ZIP match: "${cleanZip}" = "${reviewZip}"`);
      
      detailedMatches.push({
        field: 'ZIP Code',
        reviewValue: review.customer_zipcode,
        searchValue: zipCode || '',
        similarity: 1.0,
        matchType: 'exact'
      });
    }
    // Check for partial matches
    else if (reviewZip.startsWith(cleanZip) || cleanZip.startsWith(reviewZip)) {
      score += REVIEW_SEARCH_CONFIG.SCORES.PREFIX_ZIP_MATCH * zipMultiplier;
      matches++;
      
      detailedMatches.push({
        field: 'ZIP Code',
        reviewValue: review.customer_zipcode,
        searchValue: zipCode || '',
        similarity: 0.8,
        matchType: 'partial'
      });
    }
    // Check for nearby zip codes (within ~20 miles approximation)
    else if (cleanZip.length >= 5 && reviewZip.length >= 5) {
      const searchZipNum = parseInt(cleanZip.slice(0, 5));
      const reviewZipNum = parseInt(reviewZip.slice(0, 5));
      const zipDifference = Math.abs(searchZipNum - reviewZipNum);
      
      if (zipDifference <= REVIEW_SEARCH_CONFIG.ZIP_PROXIMITY_RANGE) {
        const proximityScore = Math.max(0, REVIEW_SEARCH_CONFIG.SCORES.PROXIMITY_BASE - (zipDifference / REVIEW_SEARCH_CONFIG.ZIP_PROXIMITY_MILES));
        score += proximityScore * zipMultiplier;
        matches++;
        
        detailedMatches.push({
          field: 'ZIP Code (Nearby)',
          reviewValue: review.customer_zipcode,
          searchValue: zipCode || '',
          similarity: Math.max(0, 1 - (zipDifference / REVIEW_SEARCH_CONFIG.ZIP_PROXIMITY_RANGE)),
          matchType: 'fuzzy'
        });
      }
    }
  }

  // Calculate percentage score based on fields available in the review
  // Dynamic scoring that accounts for missing data in reviews
  let maxPossibleScore = 0;
  let fieldsWithData = 0;

  // Check which fields have data and calculate max possible accordingly
  if (review.customer_name) {
    maxPossibleScore += REVIEW_SEARCH_CONFIG.SCORES.SIMILARITY_MULTIPLIER * 1.5;
    fieldsWithData++;
  }
  if (review.customer_phone) {
    maxPossibleScore += REVIEW_SEARCH_CONFIG.SCORES.PHONE_MATCH * 2;
    fieldsWithData++;
  }
  if (review.customer_address) {
    maxPossibleScore += REVIEW_SEARCH_CONFIG.SCORES.ADDRESS_SIMILARITY_MULTIPLIER * 1.5;
    fieldsWithData++;
  }
  if (review.customer_city) {
    maxPossibleScore += REVIEW_SEARCH_CONFIG.SCORES.CITY_SIMILARITY_MULTIPLIER * 1.3;
    fieldsWithData++;
  }
  if (review.customer_zipcode) {
    maxPossibleScore += REVIEW_SEARCH_CONFIG.SCORES.EXACT_ZIP_MATCH * 1.5;
    fieldsWithData++;
  }

  // Calculate percentage score and adjust for completeness
  let percentageScore = 0;
  if (maxPossibleScore > 0) {
    percentageScore = Math.round((score / maxPossibleScore) * 100);
    
    // Penalize reviews with missing critical information
    const completenessMultiplier = Math.min(1, fieldsWithData / 3); // Expect at least name, phone/address, city/zip
    percentageScore = Math.round(percentageScore * completenessMultiplier);
  }

  // Cap at 100%
  percentageScore = Math.min(100, percentageScore);

  // Apply field combination minimum score requirement
  if (percentageScore < fieldValidation.minScoreRequired) {
    console.log(`[FIELD_VALIDATION] Review ${review.id} score ${percentageScore} below required minimum ${fieldValidation.minScoreRequired} for rules: ${fieldValidation.appliedRules.join(', ')}`);
    return { 
      ...review, 
      searchScore: 0, 
      matchCount: 0,
      completenessScore,
      exactFieldMatches: 0,
      exactMatchDetails: [],
      detailedMatches: []
    };
  }

  // Apply deferred name validation for comprehensive searches
  if (nameValidationDeferred && !nameComponentMatched && (firstName || lastName)) {
    const requiredExactMatches = searchFieldCount >= 6 ? 4 : 3;
    if (exactFieldMatches < requiredExactMatches) {
      console.log(`[NAME_VALIDATION_DEFERRED] Review ${review.id} REJECTED - Insufficient exact matches (${exactFieldMatches}/${requiredExactMatches}) to bypass name validation`);
      return { 
        ...review, 
        searchScore: 0, 
        matchCount: 0,
        completenessScore,
        exactFieldMatches: 0,
        exactMatchDetails: [],
        detailedMatches: []
      };
    } else {
      console.log(`[NAME_VALIDATION_BYPASS] Review ${review.id} ACCEPTED - Bypassed name validation with ${exactFieldMatches} exact matches`);
    }
  }

  // Enhanced state-only filter - prevent weak matches from passing
  const hasMajorFields = (firstName || lastName || phone || address);
  const hasSubstantialMatch = phoneMatched || nameComponentMatched || addressMatched || cityMatched || zipMatched;
  
  // Check for truly weak matches (only state + weak city similarity)
  const hasOnlyWeakMatches = detailedMatches.length <= 2 && 
    detailedMatches.every(match => 
      match.field === 'State' || 
      (match.field === 'City' && match.similarity !== undefined && match.similarity < 0.6)
    );
  
  if (hasMajorFields && (detailedMatches.length === 1 && detailedMatches[0].field === 'State')) {
    console.log(`[STATE_ONLY_FILTER] Review ${review.id} REJECTED - Only state matched when major fields provided`);
    return { 
      ...review, 
      searchScore: 0, 
      matchCount: 0,
      completenessScore,
      exactFieldMatches: 0,
      exactMatchDetails: [],
      detailedMatches: []
    };
  }
  
  // Apply comprehensive search bonus for 5+ field searches with multiple exact matches
  if (searchFieldCount >= 5 && exactFieldMatches >= 4) {
    const comprehensiveBonus = REVIEW_SEARCH_CONFIG.SCORES.COMPREHENSIVE_SEARCH_BONUS;
    score += comprehensiveBonus;
    console.log(`[COMPREHENSIVE_BONUS] Added ${comprehensiveBonus} points for comprehensive search with ${exactFieldMatches} exact matches`);
  }

  // Filter out weak similarity matches (like La Mesa vs San Diego)
  if (hasMajorFields && hasOnlyWeakMatches && !hasSubstantialMatch) {
    console.log(`[WEAK_MATCH_FILTER] Review ${review.id} REJECTED - Only weak matches found (state + weak city)`);
    return { 
      ...review, 
      searchScore: 0, 
      matchCount: 0,
      completenessScore,
      exactFieldMatches: 0,
      exactMatchDetails: [],
      detailedMatches: []
    };
  }

  console.log(`[EXACT_MATCH_COUNT] Review ${review.id} final exact matches: ${exactFieldMatches}/${searchFieldCount}`);
  console.log(`[EXACT_MATCH_DETAILS] Fields: ${exactMatchDetails.map(d => d.field).join(', ')}`);
  
  console.log('Enhanced review scoring result:', {
    reviewId: review.id,
    customerName: review.customer_name,
    searchParams,
    businessState,
    rawScore: score,
    maxPossibleScore,
    percentageScore,
    completenessScore,
    fieldsWithData,
    finalMatches: matches,
    exactFieldMatches,
    exactMatchDetails,
    detailedMatches,
    fieldValidation
  });

  return { 
    ...review, 
    searchScore: percentageScore, 
    matchCount: matches,
    completenessScore,
    exactFieldMatches,
    exactMatchDetails,
    detailedMatches
  };
};
