
import { calculateStringSimilarity } from "@/utils/stringSimilarity";
import { compareAddresses } from "@/utils/addressNormalization";
import { REVIEW_SEARCH_CONFIG } from "./reviewSearchConfig";
import { ReviewData } from "./types";

interface ScoredReview extends ReviewData {
  searchScore: number;
  matchCount: number;
  detailedMatches: Array<{
    field: string;
    reviewValue: string;
    searchValue: string;
    similarity: number;
    matchType: 'exact' | 'partial' | 'fuzzy';
  }>;
}

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
  let score = 0;
  let matches = 0;
  const detailedMatches: Array<{
    field: string;
    reviewValue: string;
    searchValue: string;
    similarity: number;
    matchType: 'exact' | 'partial' | 'fuzzy';
  }> = [];

  // Clean phone and zip for comparison
  const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
  const cleanZip = zipCode ? zipCode.replace(/\D/g, '') : '';

  // Name matching with fuzzy logic
  if ((firstName || lastName) && review.customer_name) {
    const searchName = [firstName, lastName].filter(Boolean).join(' ').toLowerCase();
    const customerName = review.customer_name.toLowerCase();
    
    // Direct similarity
    const similarity = calculateStringSimilarity(searchName, customerName);
    if (similarity > REVIEW_SEARCH_CONFIG.SIMILARITY_THRESHOLD) {
      const points = similarity * REVIEW_SEARCH_CONFIG.SCORES.SIMILARITY_MULTIPLIER;
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
    
    // Word-by-word matching
    const searchWords = searchName.split(/\s+/);
    const nameWords = customerName.split(/\s+/);
    
    for (const searchWord of searchWords) {
      if (searchWord.length >= REVIEW_SEARCH_CONFIG.MIN_WORD_LENGTH) {
        for (const nameWord of nameWords) {
          if (nameWord.includes(searchWord) || searchWord.includes(nameWord)) {
            score += REVIEW_SEARCH_CONFIG.SCORES.WORD_MATCH;
            matches++;
          }
        }
      }
    }
  }

  // Phone matching - very flexible
  if (cleanPhone && review.customer_phone) {
    const reviewPhone = review.customer_phone.replace(/\D/g, '');
    
    // Check if phones contain each other or share significant digits
    if (reviewPhone.includes(cleanPhone) || 
        cleanPhone.includes(reviewPhone) ||
        (cleanPhone.length >= 7 && reviewPhone.includes(cleanPhone.slice(-7))) ||
        (reviewPhone.length >= 7 && cleanPhone.includes(reviewPhone.slice(-7)))) {
      score += REVIEW_SEARCH_CONFIG.SCORES.PHONE_MATCH;
      matches++;
      
      detailedMatches.push({
        field: 'Phone',
        reviewValue: review.customer_phone,
        searchValue: phone || '',
        similarity: 1.0,
        matchType: reviewPhone === cleanPhone ? 'exact' : 'partial'
      });
    }
  }

  // Address matching with enhanced fuzzy logic
  if (address && review.customer_address) {
    // Use the new address comparison function
    if (compareAddresses(address, review.customer_address, 0.9)) {
      const points = REVIEW_SEARCH_CONFIG.SCORES.ADDRESS_SIMILARITY_MULTIPLIER * 0.9;
      score += points;
      matches++;
      
      detailedMatches.push({
        field: 'Address',
        reviewValue: review.customer_address,
        searchValue: address,
        similarity: 0.9,
        matchType: 'exact'
      });
    } else if (compareAddresses(address, review.customer_address, 0.7)) {
      const points = REVIEW_SEARCH_CONFIG.SCORES.ADDRESS_SIMILARITY_MULTIPLIER * 0.7;
      score += points;
      matches++;
      
      detailedMatches.push({
        field: 'Address',
        reviewValue: review.customer_address,
        searchValue: address,
        similarity: 0.7,
        matchType: 'partial'
      });
    }
    
    // Fallback to word-by-word matching for partial matches
    const addressWords = address.toLowerCase().split(/\s+/);
    const reviewAddressWords = review.customer_address.toLowerCase().split(/\s+/);
    
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

  // City matching with fuzzy logic
  if (city && review.customer_city) {
    const similarity = calculateStringSimilarity(city.toLowerCase(), review.customer_city.toLowerCase());
    if (similarity > REVIEW_SEARCH_CONFIG.CITY_SIMILARITY_THRESHOLD || 
        review.customer_city.toLowerCase().includes(city.toLowerCase()) || 
        city.toLowerCase().includes(review.customer_city.toLowerCase())) {
      const points = similarity * REVIEW_SEARCH_CONFIG.SCORES.CITY_SIMILARITY_MULTIPLIER;
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

  // Enhanced zip code matching with proximity scoring
  if (cleanZip && review.customer_zipcode) {
    const reviewZip = review.customer_zipcode.replace(/\D/g, '');
    
    // Exact match gets highest priority
    if (reviewZip === cleanZip) {
      score += REVIEW_SEARCH_CONFIG.SCORES.EXACT_ZIP_MATCH;
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
      score += REVIEW_SEARCH_CONFIG.SCORES.PREFIX_ZIP_MATCH;
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
        score += proximityScore;
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

  // Calculate percentage score based on maximum possible score
  // Maximum possible score would be if all fields matched perfectly
  const maxPossibleScore = REVIEW_SEARCH_CONFIG.SCORES.SIMILARITY_MULTIPLIER + 
                          REVIEW_SEARCH_CONFIG.SCORES.PHONE_MATCH + 
                          REVIEW_SEARCH_CONFIG.SCORES.ADDRESS_SIMILARITY_MULTIPLIER + 
                          REVIEW_SEARCH_CONFIG.SCORES.CITY_SIMILARITY_MULTIPLIER + 
                          REVIEW_SEARCH_CONFIG.SCORES.EXACT_ZIP_MATCH + 
                          REVIEW_SEARCH_CONFIG.SCORES.EXACT_ZIP_MATCH; // State match uses same score as ZIP

  const percentageScore = Math.min(100, Math.round((score / maxPossibleScore) * 100));

  console.log('Review scoring result:', {
    reviewId: review.id,
    customerName: review.customer_name,
    searchParams,
    businessState,
    rawScore: score,
    maxPossibleScore,
    percentageScore,
    finalMatches: matches,
    detailedMatches
  });

  return { 
    ...review, 
    searchScore: percentageScore, 
    matchCount: matches,
    detailedMatches
  };
};
