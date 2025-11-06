
import { REVIEW_SEARCH_CONFIG } from "./reviewSearchConfig";
import { analyzeFieldCombination } from "./fieldCombinationRules";
import { logger } from "@/utils/logger";

const hookLogger = logger.withContext('ReviewFiltering');

interface ScoredReview {
  searchScore: number;
  matchCount: number;
  completenessScore: number;
  exactFieldMatches: number;
  exactMatchDetails: Array<{
    field: string;
    isExact: boolean;
  }>;
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
    hasAddress: boolean;
    isNameFocused: boolean;
    isLocationOnly: boolean;
    isPhoneOnly: boolean;
    isPhoneWithLocation: boolean;
    isAddressWithState: boolean;
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
  // PRECISION-BASED FILTERING: Less info = more strict, more info with names = more flexible
  let minScore: number;
  let minMatches: number;
  
  // Analyze field combination if search params are provided
  const fieldCombination = searchParams ? analyzeFieldCombination(searchParams) : null;
  
  // HIGH PRECISION (STRICT) - No names provided, require exact matches
  if (searchContext?.isLocationOnly) {
    // Location-only searches (like "Los Angeles, CA") must be very strict
    minScore = 65; // Much higher - require strong location similarity or proximity
    minMatches = 1; // At least one strong location match
  } else if (searchContext?.isPhoneOnly || (searchContext?.isPhoneWithLocation && !searchContext?.hasName)) {
    // Phone searches without names must match exactly
    minScore = 40; // Very high for phone-only searches
    minMatches = 1; // Must have the phone match
  } else if (searchContext?.isAddressWithState && !searchContext?.hasName) {
    // Address+state without names must match exactly
    minScore = 35; // High score requirement for address accuracy
    minMatches = 1; // At least one strong address match
  } 
  // MODERATE PRECISION - Names provided, allow fuzzy matching
  else if (searchContext?.isNameFocused) {
    // Name-focused searches can be more flexible with locations
    minScore = 15; // Moderate score when name is provided
    minMatches = 2; // Require name match + one other field
  } else if (searchContext?.isPhoneWithLocation && searchContext?.hasName) {
    // Phone+location WITH name can be flexible on location
    minScore = 20; // Allow for location flexibility when name is present
    minMatches = 1; // At least one strong match (name or phone)
  } else if (searchContext?.isAddressWithState && searchContext?.hasName) {
    // Address+state WITH name can be flexible on address
    minScore = 25; // Moderate requirement when name helps validate
    minMatches = 1; // Name helps validate the match
  }
  // FIELD COMBINATION ANALYSIS
  else if (fieldCombination?.combinationType === 'weak') {
    // Weak combinations need very high standards
    minScore = 40;
    minMatches = 2;
  } else if (fieldCombination?.combinationType === 'moderate') {
    // Special case: Name + location only (without phone/address) should be strict
    if (searchContext?.hasName && (searchContext?.hasLocation) && 
        !searchContext?.hasPhone && !searchContext?.hasAddress) {
      minScore = 40; // Much stricter for name + location only
      minMatches = 2; // Require both name and location matches
    } else {
      // More lenient for moderate combinations with contact info
      minScore = 12;
      minMatches = 1;
    }
  }
  // FALLBACK CASES
  else if (isSingleFieldSearch) {
    minScore = 5;
    minMatches = 1;
  } else {
    minScore = REVIEW_SEARCH_CONFIG.MINIMUM_SCORE_MULTI_FIELD;
    minMatches = REVIEW_SEARCH_CONFIG.MINIMUM_MATCHES_MULTI_FIELD;
  }

  hookLogger.debug(`Review filtering: minScore=${minScore}, minMatches=${minMatches}, isSingleField=${isSingleFieldSearch}, context=${JSON.stringify(searchContext)}, fieldCombination=${fieldCombination?.combinationType}`);
  hookLogger.debug(`Total reviews to filter: ${scoredReviews.length}`);

  const filteredReviews = scoredReviews
    .filter(review => {
      hookLogger.debug(`Review ${review.id}: score=${review.searchScore}, matches=${review.matchCount}, name="${review.customer_name}", city="${review.customer_city}", state="${review.customer_state}"`);

      // Special handling for address+state searches
      if (searchContext?.isAddressWithState) {
        // For address+state searches, require substantial address matches
        const hasAddressInDetailedMatches = review.detailedMatches?.some(match => 
          match.field === 'Address' && match.similarity >= 0.6
        );


        if (hasAddressInDetailedMatches) {
          hookLogger.debug(`Review ${review.id} passes (address+state search with address match)`);
          return true;
        } else {
          // Reject reviews that don't have meaningful address matches
          hookLogger.debug(`Review ${review.id} filtered out (address+state search, no substantial address match)`);
          return false;
        }
      }
      
      // Special handling for phone+location searches without name
      if (searchContext?.isPhoneWithLocation) {
        // Prioritize exact phone matches heavily
        const hasPhoneMatch = searchParams?.phone && review.customer_phone && 
          review.customer_phone.replace(/\D/g, '') === searchParams.phone.replace(/\D/g, '');


        if (hasPhoneMatch) {
          // Allow any phone match through, regardless of location score
          hookLogger.debug(`Review ${review.id} passes (exact phone match)`);
          return true;
        } else {
          // For non-phone matches in phone+location searches, require very high location scores
          const passes = review.searchScore >= 30 && review.matchCount >= minMatches;
          if (!passes) {
            hookLogger.debug(`Review ${review.id} filtered out (phone+location search, no phone match, low location score: ${review.searchScore})`);
          }
          return passes;
        }
      }
      
      // HIGH PRECISION filtering for location-only searches
      if (searchContext?.isLocationOnly) {
        // For strict location-only searches, require BOTH high score AND matches
        const passes = review.searchScore >= minScore && review.matchCount >= minMatches;
        if (!passes) {
          hookLogger.debug(`Review ${review.id} filtered out (location-only strict: score ${review.searchScore} < ${minScore} OR matches ${review.matchCount} < ${minMatches})`);
        }
        return passes;
      }
      
      // Standard single field searches (less strict)
      if (isSingleFieldSearch) {
        const passes = review.searchScore >= minScore || review.matchCount >= minMatches;
        if (!passes) {
          hookLogger.debug(`Review ${review.id} filtered out (single field)`);
        }
        return passes;
      }
      
      // PRIORITY RULE: 3+ exact field matches = auto-qualify (before other validation)
      const searchedFieldCount = Object.values(searchParams).filter(val => val && val.trim() !== '').length;
      if (review.exactFieldMatches >= 3 && searchedFieldCount >= 3) {
        // If name was searched, it MUST be one of the 3 exact matches
        if (searchContext?.hasName) {
          const hasExactNameMatch = review.exactMatchDetails?.find(m => m.field === 'name')?.isExact;
          if (hasExactNameMatch) {
            hookLogger.debug(`Review ${review.id} AUTO-QUALIFIED: ${review.exactFieldMatches} exact field matches including name`);
            return true; // Auto-qualify: 3+ exact matches including name
          }
        } else {
          hookLogger.debug(`Review ${review.id} AUTO-QUALIFIED: ${review.exactFieldMatches} exact field matches (no name required)`);
          return true; // Auto-qualify: 3+ exact matches, no name required
        }
      }
      
      // Additional validation for name + location only searches
      if (searchContext?.hasName && searchContext?.hasLocation &&
          !searchContext?.hasPhone && !searchContext?.hasAddress &&
          searchParams.city) {

        // STRICT NAME REQUIREMENT: Require at least one strong name match (first, last, or nickname)
        // This prevents false positives like "Isaac Wiley" matching "Pamela Haberlin" just because they're both in La Mesa
        const hasStrongNameMatch = review.detailedMatches?.some(match =>
          (match.field === 'First Name' || match.field === 'Last Name' || match.field === 'Nickname') &&
          match.similarity >= 0.7  // 70%+ similarity (allows misspellings like "Pamla" vs "Pamela")
        );

        if (!hasStrongNameMatch) {
          console.log('🔍 REJECTED REVIEW (No Strong Name Match):', {
            id: review.id,
            customerName: review.customer_name,
            detailedMatches: review.detailedMatches?.map(m => ({
              field: m.field,
              similarity: m.similarity,
              reviewValue: m.reviewValue
            })),
            searchParams: {
              firstName: searchParams.firstName,
              lastName: searchParams.lastName,
              city: searchParams.city,
              state: searchParams.state
            }
          });
          hookLogger.debug(`Review ${review.id} rejected - Name+Location search requires strong name match (>=70% similarity), found no matching first/last/nickname`);
          return false;
        }

        // For name + city + state searches, require city match if city was searched for
        const hasCityMatch = review.detailedMatches?.some(match =>
          match.field === 'City' && (match.similarity >= 0.3 || match.matchType === 'proximity')
        );

        if (!hasCityMatch) {
          hookLogger.debug(`Review ${review.id} rejected - City "${searchParams.city}" required but not matched`);
          return false;
        }

        console.log('✅ PASSED NAME+LOCATION FILTER:', {
          id: review.id,
          customerName: review.customer_name,
          score: review.searchScore,
          nameMatches: review.detailedMatches?.filter(m =>
            m.field === 'First Name' || m.field === 'Last Name' || m.field === 'Nickname'
          )
        });
      }
      
      // For name-focused and multi-field searches, require both minimum score AND minimum matches
      const passes = review.searchScore >= minScore && review.matchCount >= minMatches;
      if (!passes) {
        hookLogger.debug(`Review ${review.id} filtered out (score: ${review.searchScore} < ${minScore} OR matches: ${review.matchCount} < ${minMatches})`);
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

      // SECONDARY SORT: Direct customer matches before associate matches
      const aIsAssociate = (a as any).isAssociateMatch || false;
      const bIsAssociate = (b as any).isAssociateMatch || false;

      if (aIsAssociate !== bIsAssociate) {
        return aIsAssociate ? 1 : -1; // Direct matches (not associate) come first
      }

      // TERTIARY SORT: Conditional based on whether name fields were searched
      if (searchContext?.hasName) {
        // If name fields were searched: Sort by searchScore (highest first)
        const scoreComparison = b.searchScore - a.searchScore;
        if (scoreComparison !== 0) {
          return scoreComparison;
        }
        
        // QUATERNARY SORT: Date (newest first) when name was searched
        if (a.created_at && b.created_at) {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
      } else {
        // If no name fields: Sort by searchScore (highest first)
        const scoreComparison = b.searchScore - a.searchScore;
        if (scoreComparison !== 0) {
          return scoreComparison;
        }
        
        // QUATERNARY SORT: Alphabetical by customer name when no name was searched
        const aName = (a.customer_name || '').toLowerCase();
        const bName = (b.customer_name || '').toLowerCase();
        const nameComparison = aName.localeCompare(bName);
        if (nameComparison !== 0) {
          return nameComparison;
        }
        
        // QUATERNARY SORT: Date (newest first) as final tiebreaker
        if (a.created_at && b.created_at) {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
      }
      
      return 0;
    })
    .slice(0, REVIEW_SEARCH_CONFIG.FINAL_RESULTS_LIMIT);

  return filteredReviews;
};

export const logSearchResults = (reviews: ScoredReview[]): void => {
  hookLogger.debug("Enhanced review search results:", reviews.length);
  reviews.forEach((review, index) => {
    hookLogger.debug(`${index + 1}. Review: ${review.customer_name}, Score: ${review.searchScore}, Matches: ${review.matchCount}, Completeness: ${review.completenessScore}%, Business Verified: ${review.reviewerVerified || false}, Customer Verified: ${review.customerVerified || false}, Date: ${review.created_at}`);
  });
};
