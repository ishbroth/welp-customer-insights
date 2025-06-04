
import { supabase } from "@/integrations/supabase/client";
import { SearchParams } from "./types";
import { REVIEW_SEARCH_CONFIG } from "./reviewSearchConfig";
import { scoreReview } from "./reviewScoring";
import { filterAndSortReviews, logSearchResults } from "./reviewFiltering";
import { formatReviewData } from "./reviewDataFormatter";

export const searchReviews = async (searchParams: SearchParams) => {
  const { firstName, lastName, phone, address, city, state, zipCode } = searchParams;

  console.log("Searching reviews table with flexible matching...");
  
  // First, let's test the relationship by checking what business_ids exist in reviews
  const { data: reviewBusinessIds, error: reviewIdsError } = await supabase
    .from('reviews')
    .select('business_id')
    .limit(10);
    
  console.log("Sample business_ids from reviews:", reviewBusinessIds);
  
  // Check if these business_ids exist in profiles
  if (reviewBusinessIds && reviewBusinessIds.length > 0) {
    const businessIds = reviewBusinessIds.map(r => r.business_id).filter(Boolean);
    console.log("Checking these business IDs in profiles:", businessIds);
    
    const { data: matchingProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, type')
      .in('id', businessIds);
      
    console.log("Matching profiles found:", matchingProfiles);
    console.log("Profiles query error:", profilesError);
  }
  
  // Now try the join with explicit foreign key syntax
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
      content,
      created_at,
      business_id,
      business_profile:profiles(name, avatar, type)
    `)
    .limit(REVIEW_SEARCH_CONFIG.INITIAL_LIMIT);

  const { data: initialReviews, error } = await reviewQuery;
  let allReviews = initialReviews;

  if (error) {
    console.error("Review search error:", error);
    
    // Fallback: fetch reviews and profiles separately
    console.log("Falling back to separate queries...");
    
    const { data: reviewsOnly, error: reviewsError } = await supabase
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
      
    if (reviewsError) {
      console.error("Fallback reviews query failed:", reviewsError);
      throw reviewsError;
    }
    
    // Get unique business IDs
    const businessIds = [...new Set(reviewsOnly?.map(r => r.business_id).filter(Boolean) || [])];
    console.log("Business IDs to look up:", businessIds);
    
    // Fetch business profiles separately
    const { data: businessProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, avatar, type')
      .in('id', businessIds);
      
    console.log("Separately fetched business profiles:", businessProfiles);
    
    if (profilesError) {
      console.error("Business profiles query failed:", profilesError);
    }
    
    // Manually join the data
    const reviewsWithProfiles = reviewsOnly?.map(review => ({
      ...review,
      business_profile: businessProfiles?.find(profile => profile.id === review.business_id) || null
    })) || [];
    
    console.log("Manually joined reviews with profiles:", reviewsWithProfiles.slice(0, 2));
    
    // Use the manually joined data
    allReviews = reviewsWithProfiles;
  } else {
    console.log(`Found ${allReviews?.length || 0} reviews in initial query`);
    console.log("Sample review data with join:", allReviews?.[0]);
  }

  if (!allReviews || allReviews.length === 0) {
    console.log("No reviews found in initial query");
    return [];
  }

  // Get business verification statuses for all businesses in the results
  const businessIds = [...new Set(allReviews.map(review => review.business_id).filter(Boolean))];
  console.log("Business IDs to check verification for:", businessIds);
  
  let businessVerificationMap = new Map();
  
  if (businessIds.length > 0) {
    const { data: businessInfos, error: businessError } = await supabase
      .from('business_info')
      .select('id, verified')
      .in('id', businessIds);

    if (businessError) {
      console.error("Error fetching business verification status:", businessError);
    } else {
      console.log("Business info query result:", businessInfos);
      businessInfos?.forEach(business => {
        businessVerificationMap.set(business.id, Boolean(business.verified));
        console.log(`Business ${business.id} verification status: ${business.verified}`);
      });
    }
  }

  console.log("Final business verification map:", Object.fromEntries(businessVerificationMap));

  // Check if this is a single field search
  const searchFields = [firstName, lastName, phone, address, city, state, zipCode].filter(Boolean);
  const isSingleFieldSearch = searchFields.length === 1;

  // Note: State search is logged but not processed since reviews don't have customer state field
  if (state) {
    console.log("State search requested but reviews table doesn't have customer state field");
  }

  // Score each review based on how well it matches the search criteria
  const scoredReviews = allReviews.map(review => {
    const formattedReview = formatReviewData(review);
    // Add verification status from our business_info query
    const verificationStatus = businessVerificationMap.get(review.business_id) || false;
    console.log(`Setting verification status for business ${review.business_id} (${formattedReview.reviewerName}): ${verificationStatus}`);
    formattedReview.reviewerVerified = verificationStatus;
    
    return scoreReview(formattedReview, { firstName, lastName, phone, address, city, zipCode });
  });

  // Filter and sort the results
  const filteredReviews = filterAndSortReviews(scoredReviews, isSingleFieldSearch);

  // Log results for debugging
  logSearchResults(filteredReviews);
  
  return filteredReviews;
};
