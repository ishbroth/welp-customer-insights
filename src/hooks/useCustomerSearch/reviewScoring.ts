
import { calculateStringSimilarity } from "@/utils/stringSimilarity";
import { REVIEW_SEARCH_CONFIG } from "./reviewSearchConfig";
import { ReviewData } from "./types";

interface ScoredReview extends ReviewData {
  searchScore: number;
  matchCount: number;
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
  }
): ScoredReview => {
  const { firstName, lastName, phone, address, city, state, zipCode } = searchParams;
  let score = 0;
  let matches = 0;

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
      score += similarity * REVIEW_SEARCH_CONFIG.SCORES.SIMILARITY_MULTIPLIER;
      matches++;
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
    }
  }

  // Address matching with fuzzy logic
  if (address && review.customer_address) {
    const similarity = calculateStringSimilarity(address.toLowerCase(), review.customer_address.toLowerCase());
    if (similarity > REVIEW_SEARCH_CONFIG.SIMILARITY_THRESHOLD) {
      score += similarity * REVIEW_SEARCH_CONFIG.SCORES.ADDRESS_SIMILARITY_MULTIPLIER;
      matches++;
    }
    
    // Check for house number or street name matches
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

  // City matching
  if (city && review.customer_city) {
    const similarity = calculateStringSimilarity(city.toLowerCase(), review.customer_city.toLowerCase());
    if (similarity > REVIEW_SEARCH_CONFIG.CITY_SIMILARITY_THRESHOLD || 
        review.customer_city.toLowerCase().includes(city.toLowerCase()) || 
        city.toLowerCase().includes(review.customer_city.toLowerCase())) {
      score += similarity * REVIEW_SEARCH_CONFIG.SCORES.CITY_SIMILARITY_MULTIPLIER;
      matches++;
    }
  }

  // State matching - NEW: Check if state is provided and match against business profile
  if (state && review.business_profile?.state) {
    const searchState = state.toLowerCase().trim();
    const businessState = review.business_profile.state.toLowerCase().trim();
    
    console.log('State matching:', {
      searchState,
      businessState,
      matches: searchState === businessState
    });
    
    if (searchState === businessState) {
      score += REVIEW_SEARCH_CONFIG.SCORES.EXACT_ZIP_MATCH; // Use a high score for state match
      matches++;
    }
  }

  // Enhanced zip code matching with proximity scoring
  if (cleanZip && review.customer_zipcode) {
    const reviewZip = review.customer_zipcode.replace(/\D/g, '');
    
    // Exact match gets highest priority
    if (reviewZip === cleanZip) {
      score += REVIEW_SEARCH_CONFIG.SCORES.EXACT_ZIP_MATCH;
      matches++;
    }
    // Check for partial matches
    else if (reviewZip.startsWith(cleanZip) || cleanZip.startsWith(reviewZip)) {
      score += REVIEW_SEARCH_CONFIG.SCORES.PREFIX_ZIP_MATCH;
      matches++;
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
      }
    }
  }

  console.log('Review scoring result:', {
    reviewId: review.id,
    customerName: review.customer_name,
    searchParams,
    finalScore: score,
    finalMatches: matches
  });

  return { 
    ...review, 
    searchScore: score, 
    matchCount: matches
  };
};
