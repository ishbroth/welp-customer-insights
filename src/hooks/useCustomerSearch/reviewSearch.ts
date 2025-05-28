
import { supabase } from "@/integrations/supabase/client";
import { SearchParams, ReviewData } from "./types";
import { calculateStringSimilarity } from "@/utils/stringSimilarity";

export const searchReviews = async (searchParams: SearchParams) => {
  const { firstName, lastName, phone, address, city, zipCode } = searchParams;

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
    .limit(200); // Increased limit for broader search

  const { data: allReviews, error } = await reviewQuery;

  if (error) {
    console.error("Review search error:", error);
    throw error;
  }

  if (!allReviews || allReviews.length === 0) {
    return [];
  }

  // Format phone for search by removing non-digit characters
  const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
  const cleanZip = zipCode ? zipCode.replace(/\D/g, '') : '';

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
      if (similarity > 0.4) { // Lower threshold for more matches
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
      if (similarity > 0.3) {
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
      if (similarity > 0.5) {
        score += similarity * 1.5;
        matches++;
      }
    }

    // Zip code matching - flexible
    if (cleanZip && review.customer_zipcode) {
      const reviewZip = review.customer_zipcode.replace(/\D/g, '');
      
      // Check for zip codes that start with the input, contain it, or are nearby
      if (reviewZip.startsWith(cleanZip) || 
          reviewZip.includes(cleanZip) ||
          cleanZip.startsWith(reviewZip) ||
          (cleanZip.length >= 5 && reviewZip.length >= 5 && 
           Math.abs(parseInt(cleanZip.slice(0, 5)) - parseInt(reviewZip.slice(0, 5))) <= 10)) {
        score += 2;
        matches++;
      }
    }

    // Properly format the business profile data
    const businessProfile = review.profiles ? {
      name: review.profiles.name || 'Unknown Business',
      avatar: review.profiles.avatar || undefined
    } : null;

    return { 
      ...review, 
      searchScore: score, 
      matchCount: matches,
      // Include properly formatted business profile data
      business_profile: businessProfile
    };
  });

  // Filter and sort by relevance
  const filteredReviews = scoredReviews
    .filter(review => review.searchScore > 0.5 || review.matchCount > 0) // Very lenient threshold
    .sort((a, b) => {
      // Sort by match count first, then by score
      if (b.matchCount !== a.matchCount) {
        return b.matchCount - a.matchCount;
      }
      return b.searchScore - a.searchScore;
    })
    .slice(0, 50); // Limit final results

  console.log("Flexible review search results:", filteredReviews.length);
  console.log("Sample review with business profile:", filteredReviews[0]?.business_profile);
  return filteredReviews as ReviewData[];
};
