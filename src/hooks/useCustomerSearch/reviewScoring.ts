
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
  
  // Early rejection for name+phone searches where either field fails
  if (isNamePhoneSearch && (!nameMatchFound || !phoneMatchFound)) {
    console.log(`[MULTI_FIELD_VALIDATION] Review ${review.id} REJECTED - Name+Phone search failed. Name match: ${nameMatchFound}, Phone match: ${phoneMatchFound}`);
    return { 
      ...review, 
      searchScore: 0, 
      matchCount: 0,
      completenessScore,
      detailedMatches: []
    };
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
    
    if (finalSimilarity > 0.6) { // Much stricter threshold to prevent weak matches
      // MASSIVELY increased base score for names - this is now the dominant factor
      let namePoints = 0;
      
      if (finalSimilarity >= 0.8) {
        namePoints = 60; // Excellent match
      } else if (finalSimilarity >= 0.7) {
        namePoints = finalSimilarity * 50; // Good match: 35-50 points
      } else if (finalSimilarity >= 0.6) {
        namePoints = finalSimilarity * 25; // Fair match: 15-25 points
      }
      
      // Context-aware bonus
      if (searchContext.isNameFocused) {
        namePoints *= 1.5; // Additional 50% for name-focused searches
      }
      
      score += namePoints;
      matches++;
      
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
      
      detailedMatches.push({
        field: 'Address',
        reviewValue: review.customer_address,
        searchValue: address,
        similarity: 0.9,
        matchType: 'exact'
      });
    } 
    // Medium confidence match
    else if (compareAddresses(address, review.customer_address, 0.7)) {
      addressScore = REVIEW_SEARCH_CONFIG.SCORES.ADDRESS_SIMILARITY_MULTIPLIER;
      addressMatched = true;
      
      detailedMatches.push({
        field: 'Address',
        reviewValue: review.customer_address,
        searchValue: address,
        similarity: 0.7,
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
    
    // Check for street number match (first word often a number)
    const searchNumber = addressWords[0];
    const reviewNumber = reviewAddressWords[0];
    if (searchNumber && reviewNumber && !isNaN(Number(searchNumber)) && searchNumber === reviewNumber) {
      addressScore += REVIEW_SEARCH_CONFIG.SCORES.ADDRESS_WORD_MATCH * 2; // Street number match is very valuable
      addressMatched = true;
    }
    
    // Check other address components
    for (const word of addressWords) {
      if (word.length >= REVIEW_SEARCH_CONFIG.MIN_WORD_LENGTH) {
        for (const reviewWord of reviewAddressWords) {
          if (reviewWord.includes(word) || word.includes(reviewWord)) {
            addressScore += REVIEW_SEARCH_CONFIG.SCORES.ADDRESS_WORD_MATCH;
            addressMatched = true;
          }
        }
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

  // Enhanced city matching with fuzzy logic and geographic proximity
  if (city && review.customer_city) {
    const similarity = calculateStringSimilarity(city.toLowerCase(), review.customer_city.toLowerCase());
    let cityMatched = false;
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
      }
      
      cityMatched = true;
      matchType = similarity >= 0.9 ? 'exact' : 'partial';
      
      console.log(`[CITY_MATCH] String match found: "${city}" -> "${review.customer_city}" (similarity: ${similarity.toFixed(2)})`);
    }
    
    // Check geographic proximity if string matching didn't work or for additional scoring
    if (REVIEW_SEARCH_CONFIG.CITY_GEOCODING_ENABLED && state && businessState) {
      try {
        const { isInProximity, distance } = await areCitiesInProximity(
          city, 
          state, 
          review.customer_city, 
          businessState
        );
        
        if (isInProximity && distance !== undefined) {
          const proximityScore = calculateProximityScore(distance);
          
          if (!cityMatched && proximityScore > 0) {
            // Geographic match without string match
            points = proximityScore;
            cityMatched = true;
            matchType = 'proximity';
            console.log(`[CITY_PROXIMITY] Geographic match: "${city}, ${state}" <-> "${review.customer_city}, ${businessState}": ${distance.toFixed(1)} miles (score: ${proximityScore.toFixed(2)})`);
          } else if (cityMatched && proximityScore > 0) {
            // Boost existing string match with proximity bonus
            points += proximityScore * 0.5;
            console.log(`[CITY_PROXIMITY] Boosting string match: "${city}, ${state}" <-> "${review.customer_city}, ${businessState}": ${distance.toFixed(1)} miles (bonus: ${(proximityScore * 0.5).toFixed(2)})`);
          }
        }
      } catch (error) {
        console.warn('Error checking city proximity:', error);
        // Continue with string-based matching even if geocoding fails
      }
    }
    
    if (cityMatched) {
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
    }
  }

  // Enhanced state matching with normalized comparison
  if (state && businessState) {
    // Use normalized state comparison to handle CA vs California
    if (compareStates(state, businessState)) {
      // For address+state searches, only give state points if address also matched
      if (searchContext.isAddressWithState) {
        if (addressMatched) {
          score += REVIEW_SEARCH_CONFIG.SCORES.EXACT_ZIP_MATCH;
          matches++;
          console.log(`[STATE_MATCH] Address+State search: state bonus added for "${state}" <-> "${businessState}"`);
        } else {
          console.log(`[STATE_NO_BONUS] Address+State search: no state bonus (address didn't match)`);
        }
      } else {
        // For other search types, always give state points
        score += REVIEW_SEARCH_CONFIG.SCORES.EXACT_ZIP_MATCH;
        matches++;
        console.log(`[STATE_MATCH] Normalized state match: "${state}" <-> "${businessState}"`);
      }
      
      detailedMatches.push({
        field: 'State',
        reviewValue: businessState,
        searchValue: state,
        similarity: 1.0,
        matchType: 'exact'
      });
    } else {
      // Apply state mismatch penalty for location-focused searches
      const hasLocationFocus = Boolean(city || zipCode || address);
      if (hasLocationFocus && !phone && !(firstName && lastName)) {
        // Heavy penalty for location-only searches with wrong state
        score *= 0.3; // Reduce score by 70%
        console.log(`[STATE_PENALTY] Applied heavy state mismatch penalty to review ${review.id}: ${state} vs ${businessState}`);
      } else if (hasLocationFocus) {
        // Moderate penalty for mixed searches with wrong state
        score *= 0.7; // Reduce score by 30%
        console.log(`[STATE_PENALTY] Applied moderate state mismatch penalty to review ${review.id}: ${state} vs ${businessState}`);
      }
    }
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
      detailedMatches: []
    };
  }

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
    detailedMatches,
    fieldValidation
  });

  return { 
    ...review, 
    searchScore: percentageScore, 
    matchCount: matches,
    completenessScore,
    detailedMatches
  };
};
