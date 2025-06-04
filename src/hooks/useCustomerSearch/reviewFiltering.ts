
import { REVIEW_SEARCH_CONFIG } from "./reviewSearchConfig";

interface ScoredReview {
  searchScore: number;
  matchCount: number;
  reviewerVerified?: boolean;
  created_at?: string;
  [key: string]: any;
}

export const filterAndSortReviews = (
  scoredReviews: ScoredReview[],
  isSingleFieldSearch: boolean
): ScoredReview[] => {
  // For single field searches, be very lenient - return anything with any match
  let minScore = 0.1;
  if (isSingleFieldSearch) {
    minScore = 0; // Return anything with any score at all for single field searches
  }

  const filteredReviews = scoredReviews
    .filter(review => review.searchScore > minScore || review.matchCount > 0)
    .sort((a, b) => {
      // First, prioritize verified reviewers
      if (a.reviewerVerified !== b.reviewerVerified) {
        return b.reviewerVerified ? 1 : -1;
      }
      
      // Then sort by match count first, then by score
      if (b.matchCount !== a.matchCount) {
        return b.matchCount - a.matchCount;
      }
      
      // If match counts are equal, sort by score
      if (b.searchScore !== a.searchScore) {
        return b.searchScore - a.searchScore;
      }
      
      // Finally, sort by date (newest first) for reviews with same score and match count
      if (a.created_at && b.created_at) {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      
      return 0;
    })
    .slice(0, REVIEW_SEARCH_CONFIG.FINAL_RESULTS_LIMIT);

  return filteredReviews;
};

export const logSearchResults = (reviews: ScoredReview[]): void => {
  console.log("Review search results:", reviews.length);
  reviews.forEach(review => {
    console.log(`Review: ${review.customer_name}, Zip: ${review.customer_zipcode}, Score: ${review.searchScore}, Verified: ${review.reviewerVerified || false}, Date: ${review.created_at}`);
  });
};
