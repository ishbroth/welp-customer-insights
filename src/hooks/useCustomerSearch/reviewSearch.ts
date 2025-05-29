
import { supabase } from "@/integrations/supabase/client";
import { SearchParams, ReviewData } from "./types";
import { calculateStringSimilarity } from "@/utils/stringSimilarity";

export const searchReviews = async (searchParams: SearchParams) => {
  const { firstName, lastName, phone, address, city, state, zipCode } = searchParams;

  console.log("Searching reviews table with flexible matching...");
  
  // Get a broader set of reviews to work with, including business profile data
  let reviewQuery = supabase
    .from('reviews')
    .select(`
      id, 
      customer_name, 
      customer_address, 
      customer_city, 
      customer_zipcode, 
      customer_phone, 
      rating,
      business_id,
      profiles!business_id(name, avatar)
    `)
    .limit(500); // Increased limit for broader search

  const { data: allReviews, error } = await reviewQuery;

  if (error) {
    console.error("Review search error:", error);
    throw error;
  }

  if (!allReviews || allReviews.length === 0) {
    console.log("No reviews found in initial query");
    return [];
  }

  console.log(`Found ${allReviews.length} reviews in initial query`);

  // Format phone for search by removing non-digit characters
  const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
  const cleanZip = zipCode ? zipCode.replace(/\D/g, '') : '';

  // Check if this is a single field search
  const searchFields = [firstName, lastName, phone, address, city, state, zipCode].filter(Boolean);
  const isSingleFieldSearch = searchFields.length === 1;
  const isStateOnlySearch = state && searchFields.length === 1 && searchFields[0] === state;

  // Score each review based on how well it matches the search criteria
  const scoredReviews = allReviews.map(review => {
    let score = 0;
    let matches = 0;

    // Name matching with fuzzy logic
    if ((firstName || lastName) && review.customer_name) {
      const searchName = [firstName, lastName].filter(Boolean).join(' ').toLowerCase();
      const customerName = review.customer_name.toLowerCase();
      
      // Direct similarity
      const similarity = calculateStringSimilarity(searchName, customerName);
      if (similarity > 0.2) { // Very low threshold for more matches
        score += similarity * 3;
        matches++;
      }
      
      // Word-by-word matching
      const searchWords = searchName.split(/\s+/);
      const nameWords = customerName.split(/\s+/);
      
      for (const searchWord of searchWords) {
        if (searchWord.length >= 2) {
          for (const nameWord of nameWords) {
            if (nameWord.includes(searchWord) || searchWord.includes(nameWord)) {
              score += 1;
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
        score += 2.5;
        matches++;
      }
    }

    // Address matching with fuzzy logic
    if (address && review.customer_address) {
      const similarity = calculateStringSimilarity(address.toLowerCase(), review.customer_address.toLowerCase());
      if (similarity > 0.2) { // Lower threshold
        score += similarity * 2;
        matches++;
      }
      
      // Check for house number or street name matches
      const addressWords = address.toLowerCase().split(/\s+/);
      const reviewAddressWords = review.customer_address.toLowerCase().split(/\s+/);
      
      for (const word of addressWords) {
        if (word.length >= 2) {
          for (const reviewWord of reviewAddressWords) {
            if (reviewWord.includes(word) || word.includes(reviewWord)) {
              score += 0.5;
              matches++;
            }
          }
        }
      }
    }

    // City matching
    if (city && review.customer_city) {
      const similarity = calculateStringSimilarity(city.toLowerCase(), review.customer_city.toLowerCase());
      if (similarity > 0.3 || review.customer_city.toLowerCase().includes(city.toLowerCase()) || city.toLowerCase().includes(review.customer_city.toLowerCase())) {
        score += similarity * 1.5;
        matches++;
      }
    }

    // State matching - Note: reviews don't have customer_state field, so we skip this
    // The reviews table structure doesn't include customer state information
    if (state) {
      // Since reviews don't have state info, we can't match on state
      // This is a limitation of the current database schema
      console.log("State search requested but reviews table doesn't have customer state field");
    }

    // Enhanced zip code matching with proximity scoring
    if (cleanZip && review.customer_zipcode) {
      const reviewZip = review.customer_zipcode.replace(/\D/g, '');
      
      // Exact match gets highest priority
      if (reviewZip === cleanZip) {
        score += 10; // Very high score for exact matches
        matches++;
      }
      // Check for partial matches
      else if (reviewZip.startsWith(cleanZip) || cleanZip.startsWith(reviewZip)) {
        score += 5; // High score for prefix matches
        matches++;
      }
      // Check for nearby zip codes (within ~20 miles approximation)
      else if (cleanZip.length >= 5 && reviewZip.length >= 5) {
        const searchZipNum = parseInt(cleanZip.slice(0, 5));
        const reviewZipNum = parseInt(reviewZip.slice(0, 5));
        const zipDifference = Math.abs(searchZipNum - reviewZipNum);
        
        // Approximate 20-mile radius using zip code ranges
        // This is a rough approximation as zip code proximity varies by region
        if (zipDifference <= 50) { // Within ~20 miles for most areas
          const proximityScore = Math.max(0, 2 - (zipDifference / 25)); // Closer zips get higher scores
          score += proximityScore;
          matches++;
        }
      }
    }

    // Properly format the business profile data
    const businessProfile = review.profiles ? {
      name: review.profiles.name || 'Unknown Business',
      avatar: review.profiles.avatar || undefined
    } : null;

    // Return the properly formatted review data
    const formattedReview: ReviewData = {
      id: review.id,
      customer_name: review.customer_name || '',
      customer_address: review.customer_address || '',
      customer_city: review.customer_city || '',
      customer_zipcode: review.customer_zipcode || '',
      customer_phone: review.customer_phone || '',
      rating: review.rating,
      business_id: review.business_id,
      business_profile: businessProfile
    };

    return { 
      ...formattedReview, 
      searchScore: score, 
      matchCount: matches
    };
  });

  // For single field searches, be very lenient - return anything with any match
  let minScore = 0.1;
  if (isSingleFieldSearch) {
    minScore = 0; // Return anything with any score at all for single field searches
  }

  const filteredReviews = scoredReviews
    .filter(review => review.searchScore > minScore || review.matchCount > 0)
    .sort((a, b) => {
      // Sort by match count first, then by score
      if (b.matchCount !== a.matchCount) {
        return b.matchCount - a.matchCount;
      }
      return b.searchScore - a.searchScore;
    })
    .slice(0, 100); // Increased final results limit

  console.log("Review search results:", filteredReviews.length);
  filteredReviews.forEach(review => {
    console.log(`Review: ${review.customer_name}, Zip: ${review.customer_zipcode}, Score: ${review.searchScore}`);
  });
  
  return filteredReviews;
};
