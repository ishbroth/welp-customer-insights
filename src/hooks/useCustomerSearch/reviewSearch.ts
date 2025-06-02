
import { supabase } from "@/integrations/supabase/client";
import { SearchParams } from "./types";
import { REVIEW_SEARCH_CONFIG } from "./reviewSearchConfig";
import { scoreReview } from "./reviewScoring";
import { filterAndSortReviews, logSearchResults } from "./reviewFiltering";
import { formatReviewData } from "./reviewDataFormatter";

export const searchReviews = async (searchParams: SearchParams) => {
  const { firstName, lastName, phone, address, city, state, zipCode } = searchParams;

  console.log("Searching reviews table with flexible matching...");
  
  // Get a broader set of reviews to work with, including business profile data and verification status
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
      profiles!business_id(name, avatar),
      business_info!business_id(verified)
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
    // Add verification status to the review
    formattedReview.reviewerVerified = review.business_info?.verified || false;
    return scoreReview(formattedReview, { firstName, lastName, phone, address, city, zipCode });
  });

  // Filter and sort the results
  const filteredReviews = filterAndSortReviews(scoredReviews, isSingleFieldSearch);

  // Log results for debugging
  logSearchResults(filteredReviews);
  
  return filteredReviews;
};
