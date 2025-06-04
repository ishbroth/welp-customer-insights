
import { supabase } from "@/integrations/supabase/client";
import { SearchParams } from "./types";
import { REVIEW_SEARCH_CONFIG } from "./reviewSearchConfig";
import { scoreReview } from "./reviewScoring";
import { filterAndSortReviews, logSearchResults } from "./reviewFiltering";
import { formatReviewData } from "./reviewDataFormatter";

export const searchReviews = async (searchParams: SearchParams) => {
  const { firstName, lastName, phone, address, city, state, zipCode } = searchParams;

  console.log("=== REVIEW SEARCH START ===");
  console.log("Search parameters:", searchParams);
  
  // Get all reviews with business profile data
  const { data: allReviews, error } = await supabase
    .from('reviews')
    .select(`
      id, 
      customer_name, 
      customer_address, 
      customer_city, 
      customer_zipcode, 
      customer_phone, 
      rating,
      content,
      created_at,
      business_id
    `)
    .limit(REVIEW_SEARCH_CONFIG.INITIAL_LIMIT);

  if (error) {
    console.error("Review search error:", error);
    throw error;
  }

  if (!allReviews || allReviews.length === 0) {
    console.log("No reviews found in database");
    return [];
  }

  console.log(`Found ${allReviews.length} total reviews in database`);

  // Get business profiles and verification status
  const businessIds = [...new Set(allReviews.map(review => review.business_id).filter(Boolean))];
  console.log("Fetching business data for IDs:", businessIds);
  
  let businessProfilesMap = new Map();
  let businessVerificationMap = new Map();
  
  if (businessIds.length > 0) {
    // Fetch business profiles with state information
    const { data: businessProfiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, name, avatar, type, state')
      .in('id', businessIds)
      .eq('type', 'business');

    if (profileError) {
      console.error("Error fetching business profiles:", profileError);
    } else {
      console.log("Business profiles found:", businessProfiles?.length || 0);
      businessProfiles?.forEach(profile => {
        businessProfilesMap.set(profile.id, profile);
        console.log(`Profile mapping: ${profile.id} -> ${profile.name} (State: ${profile.state})`);
      });
    }

    // Fetch business verification statuses - THIS IS THE KEY PART
    const { data: businessInfos, error: businessError } = await supabase
      .from('business_info')
      .select('id, verified')
      .in('id', businessIds);

    if (businessError) {
      console.error("Error fetching business verification status:", businessError);
    } else {
      console.log("Business verification data found:", businessInfos?.length || 0);
      businessInfos?.forEach(business => {
        const isVerified = Boolean(business.verified);
        businessVerificationMap.set(business.id, isVerified);
        console.log(`Business verification mapping: ${business.id} -> verified: ${isVerified}`);
      });
    }
  }

  // Check if this is a single field search
  const searchFields = [firstName, lastName, phone, address, city, state, zipCode].filter(Boolean);
  const isSingleFieldSearch = searchFields.length === 1;

  console.log(`Processing ${allReviews.length} reviews for search matching...`);
  console.log("Is single field search:", isSingleFieldSearch);

  // Score each review based on how well it matches the search criteria
  const scoredReviews = allReviews.map(review => {
    // Add the business profile data to the review
    const businessProfile = businessProfilesMap.get(review.business_id);
    const reviewWithProfile = {
      ...review,
      profiles: businessProfile || null
    };
    
    const formattedReview = formatReviewData(reviewWithProfile);
    
    // Add verification status - ENSURE THIS IS PROPERLY SET
    const verificationStatus = businessVerificationMap.get(review.business_id) || false;
    formattedReview.reviewerVerified = verificationStatus;
    
    console.log(`Review verification check: Business ID ${review.business_id}, Verification Status: ${verificationStatus}, Business Name: ${formattedReview.reviewerName}`);
    
    const scoredReview = scoreReview(formattedReview, { firstName, lastName, phone, address, city, state, zipCode });
    
    console.log(`Review ${review.id}: Customer "${review.customer_name}", Score: ${scoredReview.searchScore}, Matches: ${scoredReview.matchCount}, Business: ${formattedReview.reviewerName}, Verified: ${verificationStatus}, Business State: ${businessProfile?.state}`);
    
    return scoredReview;
  });

  // Filter and sort the results
  const filteredReviews = filterAndSortReviews(scoredReviews, isSingleFieldSearch);

  // Log results for debugging
  logSearchResults(filteredReviews);
  
  console.log("=== REVIEW SEARCH COMPLETE ===");
  return filteredReviews;
};
