
import { supabase } from "@/integrations/supabase/client";
import { SearchParams } from "./types";
import { REVIEW_SEARCH_CONFIG } from "./reviewSearchConfig";
import { scoreReview } from "./reviewScoring";
import { filterAndSortReviews, logSearchResults } from "./reviewFiltering";
import { formatReviewData } from "./reviewDataFormatter";

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
    .limit(REVIEW_SEARCH_CONFIG.INITIAL_LIMIT);

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

  // Now get business verification status for each business_id found
  const businessIds = [...new Set(allReviews.map(review => review.business_id).filter(Boolean))];
  let businessVerificationMap = new Map();

  console.log("Business IDs found in reviews:", businessIds);

  if (businessIds.length > 0) {
    const { data: businessInfoData, error: businessError } = await supabase
      .from('business_info')
      .select('id, verified')
      .in('id', businessIds);

    console.log("Business info query result:", businessInfoData);
    console.log("Business info query error:", businessError);

    if (businessInfoData) {
      businessInfoData.forEach(info => {
        console.log(`Business ${info.id} verification status: ${info.verified}`);
        businessVerificationMap.set(info.id, info.verified);
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
    // Add verification status from our separate query
    const verificationStatus = businessVerificationMap.get(review.business_id) || false;
    console.log(`Setting verification status for business ${review.business_id}: ${verificationStatus}`);
    formattedReview.reviewerVerified = verificationStatus;
    return scoreReview(formattedReview, { firstName, lastName, phone, address, city, zipCode });
  });

  // Filter and sort the results
  const filteredReviews = filterAndSortReviews(scoredReviews, isSingleFieldSearch);

  // Log results for debugging
  logSearchResults(filteredReviews);
  
  return filteredReviews;
};
