
import { calculateStringSimilarity } from "@/utils/stringSimilarity";
import { compareAddresses } from "@/utils/addressNormalization";
import { REVIEW_SEARCH_CONFIG } from "./reviewSearchConfig";
import { ReviewData } from "./types";

interface ScoredReview extends ReviewData {
  searchScore: number;
  matchCount: number;
  completenessScore: number;
  detailedMatches: Array<{
    field: string;
    reviewValue: string;
    searchValue: string;
    similarity: number;
    matchType: 'exact' | 'partial' | 'fuzzy';
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
  
  return {
    hasName,
    hasLocation,
    hasPhone,
    isNameFocused: hasName && (hasLocation || hasPhone),
    isLocationOnly: !hasName && !hasPhone && hasLocation,
    isPhoneOnly: !hasName && hasPhone && !hasLocation
  };
};

export const scoreReview = (
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
): ScoredReview => {
  const { firstName, lastName, phone, address, city, state, zipCode } = searchParams;
  const searchContext = detectSearchContext(searchParams);
  
  let score = 0;
  let matches = 0;
  const detailedMatches: Array<{
    field: string;
    reviewValue: string;
    searchValue: string;
    similarity: number;
    matchType: 'exact' | 'partial' | 'fuzzy';
  }> = [];

  // Calculate completeness score for this review
  const completenessScore = calculateCompletenessScore(review);

  // Clean phone and zip for comparison
  const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
  const cleanZip = zipCode ? zipCode.replace(/\D/g, '') : '';

  // Early exit for name-focused searches with poor name similarity
  if (searchContext.hasName && review.customer_name) {
    const searchName = [firstName, lastName].filter(Boolean).join(' ').toLowerCase();
    const customerName = review.customer_name.toLowerCase();
    const nameSimilarity = calculateStringSimilarity(searchName, customerName);
    
    // If this is a name-focused search and name similarity is too low, return early with minimal score
    if (searchContext.isNameFocused && nameSimilarity < 0.4) {
      return { 
        ...review, 
        searchScore: 0, 
        matchCount: 0,
        completenessScore,
        detailedMatches: []
      };
    }
  }

  // Enhanced name matching with context-aware weighting
  if ((firstName || lastName) && review.customer_name) {
    const searchName = [firstName, lastName].filter(Boolean).join(' ').toLowerCase();
    const customerName = review.customer_name.toLowerCase();
    
    // Direct similarity with dynamic weight based on search context
    const similarity = calculateStringSimilarity(searchName, customerName);
    console.log(`Review ${review.id} name similarity: "${searchName}" vs "${customerName}" = ${similarity}`);
    
    if (similarity > 0.3) { // Lower threshold but we'll weight differently
      let baseMultiplier = REVIEW_SEARCH_CONFIG.SCORES.SIMILARITY_MULTIPLIER;
      
      // Context-aware scoring: name gets much higher weight in name-focused searches
      if (searchContext.isNameFocused) {
        baseMultiplier *= 3; // Triple weight for name in name-focused searches
      }
      
      let points = similarity * baseMultiplier;
      
      // Bonus for very high similarity
      if (similarity >= 0.95) {
        points *= 2; // Double bonus for near-exact name matches
      } else if (similarity >= 0.85) {
        points *= 1.5; // 50% bonus for very close matches
      } else if (similarity >= 0.7) {
        points *= 1.2; // 20% bonus for good matches
      }
      
      score += points;
      matches++;
      
      detailedMatches.push({
        field: 'Name',
        reviewValue: review.customer_name,
        searchValue: [firstName, lastName].filter(Boolean).join(' '),
        similarity,
        matchType: similarity >= 0.9 ? 'exact' : similarity >= 0.7 ? 'partial' : 'fuzzy'
      });
    }
    
    // Word-by-word matching with position awareness
    const searchWords = searchName.split(/\s+/);
    const nameWords = customerName.split(/\s+/);
    
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

  // Enhanced phone matching with partial number support
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
    // Check if phones contain each other or share significant digits
    else if (reviewPhone.includes(cleanPhone) || 
             cleanPhone.includes(reviewPhone) ||
             (cleanPhone.length >= 7 && reviewPhone.includes(cleanPhone.slice(-7))) ||
             (reviewPhone.length >= 7 && cleanPhone.includes(reviewPhone.slice(-7)))) {
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

  // Enhanced address matching with street number awareness
  if (address && review.customer_address) {
    // Check for high-confidence address match first
    if (compareAddresses(address, review.customer_address, 0.9)) {
      score += REVIEW_SEARCH_CONFIG.SCORES.ADDRESS_SIMILARITY_MULTIPLIER * 1.5;
      matches++;
      
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
      score += REVIEW_SEARCH_CONFIG.SCORES.ADDRESS_SIMILARITY_MULTIPLIER;
      matches++;
      
      detailedMatches.push({
        field: 'Address',
        reviewValue: review.customer_address,
        searchValue: address,
        similarity: 0.7,
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
      score += REVIEW_SEARCH_CONFIG.SCORES.ADDRESS_WORD_MATCH * 2; // Street number match is very valuable
      matches++;
    }
    
    // Check other address components
    for (const word of addressWords) {
      if (word.length >= REVIEW_SEARCH_CONFIG.MIN_WORD_LENGTH) {
        for (const reviewWord of reviewAddressWords) {
          if (reviewWord.includes(word) || word.includes(reviewWord)) {
            score += REVIEW_SEARCH_CONFIG.SCORES.ADDRESS_WORD_MATCH;
            matches++;
          }
        }
      }
    }
  }

  // Enhanced city matching with fuzzy logic
  if (city && review.customer_city) {
    const similarity = calculateStringSimilarity(city.toLowerCase(), review.customer_city.toLowerCase());
    if (similarity > REVIEW_SEARCH_CONFIG.CITY_SIMILARITY_THRESHOLD || 
        review.customer_city.toLowerCase().includes(city.toLowerCase()) || 
        city.toLowerCase().includes(review.customer_city.toLowerCase())) {
      
      let points = similarity * REVIEW_SEARCH_CONFIG.SCORES.CITY_SIMILARITY_MULTIPLIER;
      
      // Bonus for exact city match
      if (similarity >= 0.95) {
        points *= 1.3;
      }
      
      score += points;
      matches++;
      
      detailedMatches.push({
        field: 'City',
        reviewValue: review.customer_city,
        searchValue: city,
        similarity,
        matchType: similarity >= 0.9 ? 'exact' : 'partial'
      });
    }
  }

  // State matching - Use the business state parameter directly
  if (state && businessState) {
    const searchState = state.toLowerCase().trim();
    const reviewBusinessState = businessState.toLowerCase().trim();
    
    if (searchState === reviewBusinessState) {
      score += REVIEW_SEARCH_CONFIG.SCORES.EXACT_ZIP_MATCH;
      matches++;
      
      detailedMatches.push({
        field: 'State',
        reviewValue: businessState,
        searchValue: state,
        similarity: 1.0,
        matchType: 'exact'
      });
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
    detailedMatches
  });

  return { 
    ...review, 
    searchScore: percentageScore, 
    matchCount: matches,
    completenessScore,
    detailedMatches
  };
};
