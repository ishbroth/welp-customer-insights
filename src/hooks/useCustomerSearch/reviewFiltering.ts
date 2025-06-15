
import { REVIEW_SEARCH_CONFIG } from "./reviewSearchConfig";

interface ScoredReview {
  searchScore: number;
  matchCount: number;
  reviewerVerified?: boolean;
  customerVerified?: boolean;
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
      // New priority ranking system:
      // 1. Reviews by verified business accounts (highest priority)
      // 2. Reviews claimed by verified customers 
      // 3. All other reviews
      // Within each category, sort by date (newest first)
      
      const aBusinessVerified = Boolean(a.reviewerVerified);
      const bBusinessVerified = Boolean(b.reviewerVerified);
      const aCustomerVerified = Boolean(a.customerVerified);
      const bCustomerVerified = Boolean(b.customerVerified);
      
      // Calculate priority scores
      const getPriorityScore = (businessVerified: boolean, customerVerified: boolean) => {
        if (businessVerified) return 3; // Highest priority
        if (customerVerified) return 2; // Medium priority
        return 1; // Lowest priority
      };
      
      const aPriority = getPriorityScore(aBusinessVerified, aCustomerVerified);
      const bPriority = getPriorityScore(bBusinessVerified, bCustomerVerified);
      
      // First sort by priority level
      if (bPriority !== aPriority) {
        return bPriority - aPriority;
      }
      
      // Within same priority level, sort by match count first
      if (b.matchCount !== a.matchCount) {
        return b.matchCount - a.matchCount;
      }
      
      // Then by search score
      if (b.searchScore !== a.searchScore) {
        return b.searchScore - a.searchScore;
      }
      
      // Finally, sort by date (newest first) for reviews with same priority, score and match count
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
    console.log(`Review: ${review.customer_name}, Zip: ${review.customer_zipcode}, Score: ${review.searchScore}, Business Verified: ${review.reviewerVerified || false}, Customer Verified: ${review.customerVerified || false}, Date: ${review.created_at}`);
  });
};
