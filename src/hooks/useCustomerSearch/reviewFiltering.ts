
import { REVIEW_SEARCH_CONFIG } from "./reviewSearchConfig";
import { analyzeFieldCombination } from "./fieldCombinationRules";

interface ScoredReview {
  searchScore: number;
  matchCount: number;
  completenessScore: number;
  reviewerVerified?: boolean;
  customerVerified?: boolean;
  created_at?: string;
  [key: string]: any;
}

export const filterAndSortReviews = (
  scoredReviews: ScoredReview[],
  isSingleFieldSearch: boolean,
  searchContext?: {
    hasName: boolean;
    hasLocation: boolean;
    hasPhone: boolean;
    isNameFocused: boolean;
    isLocationOnly: boolean;
    isPhoneOnly: boolean;
  },
  unlockedReviews?: string[],
  searchParams?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  }
): ScoredReview[] => {
  // Enhanced context-aware filtering with field combination analysis
  let minScore: number;
  let minMatches: number;
  
  // Analyze field combination if search params are provided
  const fieldCombination = searchParams ? analyzeFieldCombination(searchParams) : null;
  
  if (fieldCombination?.combinationType === 'weak') {
    // Weak combinations need very high standards
    minScore = 40;
    minMatches = 2;
  } else if (fieldCombination?.combinationType === 'moderate') {
    // Moderate combinations need good standards
    minScore = 25;
    minMatches = 2;
  } else if (searchContext?.isNameFocused) {
    // For name-focused searches, be more selective
    minScore = 15; // Higher minimum score when name is provided
    minMatches = 2; // Require at least 2 matches including name
  } else if (searchContext?.isLocationOnly) {
    // For location-only searches, use current broad matching
    minScore = 5;
    minMatches = 1;
  } else if (isSingleFieldSearch) {
    minScore = 5;
    minMatches = 1;
  } else {
    minScore = REVIEW_SEARCH_CONFIG.MINIMUM_SCORE_MULTI_FIELD;
    minMatches = REVIEW_SEARCH_CONFIG.MINIMUM_MATCHES_MULTI_FIELD;
  }

  console.log(`Review filtering: minScore=${minScore}, minMatches=${minMatches}, isSingleField=${isSingleFieldSearch}, context=${JSON.stringify(searchContext)}, fieldCombination=${fieldCombination?.combinationType}`);

  const filteredReviews = scoredReviews
    .filter(review => {
      console.log(`Review ${review.id}: score=${review.searchScore}, matches=${review.matchCount}`);
      
      if (searchContext?.isLocationOnly || isSingleFieldSearch) {
        return review.searchScore >= minScore || review.matchCount >= minMatches;
      }
      
      // For name-focused and multi-field searches, require both minimum score AND minimum matches
      return review.searchScore >= minScore && review.matchCount >= minMatches;
    })
    .sort((a, b) => {
      // PRIMARY SORT: Claimed/Unlocked reviews come first
      const aIsClaimed = unlockedReviews?.includes(a.id) || false;
      const bIsClaimed = unlockedReviews?.includes(b.id) || false;
      
      if (aIsClaimed !== bIsClaimed) {
        return bIsClaimed ? 1 : -1; // Claimed reviews first
      }
      
      // Context-aware sorting for name-focused searches
      if (searchContext?.isNameFocused) {
        // For name-focused searches, prioritize search score heavily (which now includes heavy name weighting)
        const scoreDiff = b.searchScore - a.searchScore;
        if (Math.abs(scoreDiff) > 10) {
          return scoreDiff;
        }
      }
      
      // Enhanced priority ranking system:
      // 1. Match quality (search score and match count) - highest priority
      // 2. Information completeness - medium priority
      // 3. Verification status - lower priority
      // 4. Date - lowest priority
      
      const aBusinessVerified = Boolean(a.reviewerVerified);
      const bBusinessVerified = Boolean(b.reviewerVerified);
      const aCustomerVerified = Boolean(a.customerVerified);
      const bCustomerVerified = Boolean(b.customerVerified);
      
      // Calculate match quality score (combination of search score and match count)
      const getMatchQuality = (review: ScoredReview) => {
        return (review.searchScore * 0.7) + (review.matchCount * 10 * 0.3);
      };
      
      const aMatchQuality = getMatchQuality(a);
      const bMatchQuality = getMatchQuality(b);
      
      // 1. Primary sort: Match quality (search score + match count)
      if (Math.abs(bMatchQuality - aMatchQuality) > 5) { // Only prioritize if significant difference
        return bMatchQuality - aMatchQuality;
      }
      
      // 2. Secondary sort: Information completeness
      if (Math.abs(b.completenessScore - a.completenessScore) > 20) { // Only if significant difference
        return b.completenessScore - a.completenessScore;
      }
      
      // 3. Tertiary sort: Verification status
      const getPriorityScore = (businessVerified: boolean, customerVerified: boolean) => {
        if (businessVerified) return 3; // Highest priority
        if (customerVerified) return 2; // Medium priority
        return 1; // Lowest priority
      };
      
      const aPriority = getPriorityScore(aBusinessVerified, aCustomerVerified);
      const bPriority = getPriorityScore(bBusinessVerified, bCustomerVerified);
      
      if (bPriority !== aPriority) {
        return bPriority - aPriority;
      }
      
      // 4. Final sort: Date (newest first) for reviews with similar scores
      if (a.created_at && b.created_at) {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      
      return 0;
    })
    .slice(0, REVIEW_SEARCH_CONFIG.FINAL_RESULTS_LIMIT);

  return filteredReviews;
};

export const logSearchResults = (reviews: ScoredReview[]): void => {
  console.log("Enhanced review search results:", reviews.length);
  reviews.forEach((review, index) => {
    console.log(`${index + 1}. Review: ${review.customer_name}, Score: ${review.searchScore}, Matches: ${review.matchCount}, Completeness: ${review.completenessScore}%, Business Verified: ${review.reviewerVerified || false}, Customer Verified: ${review.customerVerified || false}, Date: ${review.created_at}`);
  });
};
