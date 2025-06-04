
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
      content,
      created_at,
      business_id,
      profiles:business_id(name, avatar)
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
  console.log("Sample review data:", allReviews[0]);

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
