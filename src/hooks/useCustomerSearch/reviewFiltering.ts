
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
    isPhoneWithLocation: boolean;
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
    // More lenient for moderate combinations (like first name + location)
    minScore = 12;
    minMatches = 1;
  } else if (searchContext?.isNameFocused) {
    // For name-focused searches, be more selective
    minScore = 15; // Higher minimum score when name is provided
    minMatches = 2; // Require at least 2 matches including name
  } else if (searchContext?.isPhoneWithLocation) {
    // For phone+location searches without name, require high precision
    minScore = 20; // Much higher score requirement
    minMatches = 1; // At least one strong match (preferably phone)
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

  console.log(`🔍 Review filtering: minScore=${minScore}, minMatches=${minMatches}, isSingleField=${isSingleFieldSearch}, context=${JSON.stringify(searchContext)}, fieldCombination=${fieldCombination?.combinationType}`);

  const filteredReviews = scoredReviews
    .filter(review => {
      console.log(`🔍 Review ${review.id}: score=${review.searchScore}, matches=${review.matchCount}, name="${review.customer_name}"`);
      
      // Special handling for phone+location searches without name
      if (searchContext?.isPhoneWithLocation) {
        // Prioritize exact phone matches heavily
        const hasPhoneMatch = searchParams?.phone && review.customer_phone && 
          review.customer_phone.replace(/\D/g, '') === searchParams.phone.replace(/\D/g, '');
        
        if (hasPhoneMatch) {
          // Allow any phone match through, regardless of location score
          console.log(`✅ Review ${review.id} passes (exact phone match)`);
          return true;
        } else {
          // For non-phone matches in phone+location searches, require very high location scores
          const passes = review.searchScore >= 30 && review.matchCount >= minMatches;
          if (!passes) {
            console.log(`❌ Review ${review.id} filtered out (phone+location search, no phone match, low location score: ${review.searchScore})`);
          }
          return passes;
        }
      }
      
      if (searchContext?.isLocationOnly || isSingleFieldSearch) {
        const passes = review.searchScore >= minScore || review.matchCount >= minMatches;
        if (!passes) {
          console.log(`❌ Review ${review.id} filtered out (location/single field)`);
        }
        return passes;
      }
      
      // For name-focused and multi-field searches, require both minimum score AND minimum matches
      const passes = review.searchScore >= minScore && review.matchCount >= minMatches;
      if (!passes) {
        console.log(`❌ Review ${review.id} filtered out (score: ${review.searchScore} < ${minScore} OR matches: ${review.matchCount} < ${minMatches})`);
      }
      return passes;
    })
    .sort((a, b) => {
      // PRIMARY SORT: Claimed/Unlocked reviews come first
      const aIsClaimed = unlockedReviews?.includes(a.id) || false;
      const bIsClaimed = unlockedReviews?.includes(b.id) || false;
      
      if (aIsClaimed !== bIsClaimed) {
        return bIsClaimed ? 1 : -1; // Claimed reviews first
      }
      
      // SECONDARY SORT: Alphabetical by customer name
      const aName = (a.customer_name || '').toLowerCase();
      const bName = (b.customer_name || '').toLowerCase();
      const nameComparison = aName.localeCompare(bName);
      
      if (nameComparison !== 0) {
        return nameComparison;
      }
      
      // TERTIARY SORT: Date (newest first) for same customer name
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
