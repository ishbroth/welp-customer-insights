import { useQuery } from '@tanstack/react-query';
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatReview } from "@/utils/reviewFormatter";
import { useProfileReviewsMatching } from "./useProfileReviewsMatching";
import { useReviewMatching } from "./useReviewMatching";
import { useReviewClaims } from "./useReviewClaims";
import { logger } from '@/utils/logger';

const hookLogger = logger.withContext('ProfileReviewsQuery');

/**
 * React Query hook for fetching profile reviews with persistent caching
 *
 * Benefits over useProfileReviewsFetching:
 * - Results persist across navigation (cached in memory)
 * - Configurable staleTime (5 minutes) before auto-refetch
 * - No force refresh on mount
 * - Manual refresh via refetch() function
 */
export const useProfileReviewsQuery = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { categorizeReviews } = useProfileReviewsMatching();
  const { checkReviewMatch } = useReviewMatching();
  const { getUserClaimedReviews } = useReviewClaims();

  const fetchReviews = async () => {
    if (!currentUser) {
      hookLogger.debug("No current user, returning empty array");
      return [];
    }

    hookLogger.debug("=== FETCHING REVIEWS FOR USER (React Query) ===");
    hookLogger.debug("User type:", currentUser.type);
    hookLogger.debug("User ID:", currentUser.id);

    try {
      // If user is a customer, use the global claims system
      if (currentUser.type === "customer") {
        hookLogger.debug("🔍 Starting review search for customer...");

        // PARALLEL EXECUTION: Fetch potential matches, other user claims, and claimed reviews simultaneously
        const [potentialMatches, { data: otherUserClaims, error: claimsError }, claimedReviews] = await Promise.all([
          categorizeReviews(currentUser),
          supabase
            .from('review_claims')
            .select('review_id, claimed_by')
            .neq('claimed_by', currentUser.id),
          getUserClaimedReviews()
        ]);

        hookLogger.debug("📊 Potential review matches found:", potentialMatches.length);
        hookLogger.debug("✅ Found claimed reviews for current user:", claimedReviews.length);

        if (claimsError) {
          hookLogger.error('Error fetching other user claims:', claimsError);
        }

        const reviewsClaimedByOthers = new Set(
          otherUserClaims?.map(claim => claim.review_id) || []
        );
        hookLogger.debug("🔒 Reviews claimed by other users:", reviewsClaimedByOthers.size);

        // Filter out reviews claimed by others
        const unclaimedMatches = potentialMatches.filter(match =>
          !reviewsClaimedByOthers.has(match.review.id)
        );
        hookLogger.debug("📊 Unclaimed review matches:", unclaimedMatches.length);

        // Combine results: claimed reviews first, then unclaimed matches
        const allMatches = [
          ...claimedReviews.map(review => ({
            review,
            matchType: 'claimed' as const,
            matchScore: 100,
            matchReasons: ['Review claimed by your account']
          })),
          ...unclaimedMatches
        ];
        hookLogger.debug("📋 Total combined results:", allMatches.length);

        // Sort combined results: claimed first, then by match quality
        const sortedMatches = allMatches.sort((a, b) => {
          if (a.matchType === 'claimed' && b.matchType !== 'claimed') return -1;
          if (a.matchType !== 'claimed' && b.matchType === 'claimed') return 1;
          if (a.matchType === 'high_quality' && b.matchType === 'potential') return -1;
          if (a.matchType === 'potential' && b.matchType === 'high_quality') return 1;
          return b.matchScore - a.matchScore;
        });

        // Get all review IDs and business IDs for parallel fetching
        const reviewIds = sortedMatches.map(match => match.review.id);
        const uniqueBusinessIds = [...new Set(sortedMatches.map(m => m.review.business_id).filter(Boolean))];

        // PARALLEL EXECUTION: Fetch user responses and business profiles simultaneously
        const userResponsesMap = new Map();
        const businessProfilesMap = new Map();

        if (reviewIds.length > 0 || uniqueBusinessIds.length > 0) {
          try {
            hookLogger.debug('Fetching user responses and business profiles in parallel...');
            const [responsesResult, profilesResult] = await Promise.all([
              reviewIds.length > 0
                ? supabase
                    .from('responses')
                    .select('review_id, author_id')
                    .in('review_id', reviewIds)
                    .eq('author_id', currentUser.id)
                : Promise.resolve({ data: null, error: null }),
              uniqueBusinessIds.length > 0
                ? supabase
                    .from('profiles')
                    .select('id, name, avatar, verified, type')
                    .in('id', uniqueBusinessIds)
                : Promise.resolve({ data: null, error: null })
            ]);

            // Process user responses
            if (responsesResult.data) {
              responsesResult.data.forEach(response => {
                userResponsesMap.set(response.review_id, true);
              });
            }
            if (responsesResult.error) {
              hookLogger.error('Error fetching user responses:', responsesResult.error);
            }

            // Process business profiles
            if (profilesResult.data) {
              profilesResult.data.forEach(profile => {
                businessProfilesMap.set(profile.id, {
                  id: profile.id,
                  name: profile.name,
                  avatar: profile.avatar,
                  verified: profile.verified || false,
                  business_category: null
                });
              });
            }
            if (profilesResult.error) {
              hookLogger.error('Error batch fetching profiles:', profilesResult.error);
            }
          } catch (error) {
            hookLogger.error('Error in parallel fetch:', error);
          }
        }

        // Generate detailed matches and map business profiles
        const reviewsWithProfiles = sortedMatches.map((match) => {
          const review = match.review;
          const businessProfile = review.business_id ? businessProfilesMap.get(review.business_id) : null;

          // Generate detailed match information for all reviews
          let detailedMatches = [];
          let enhancedMatchScore = match.matchScore;
          let enhancedMatchReasons = match.matchReasons;

          // For non-claimed reviews, use the detailed matching system
          if (match.matchType !== 'claimed') {
            const detailedMatchResult = checkReviewMatch(review, currentUser);
            detailedMatches = detailedMatchResult.detailedMatches;
            enhancedMatchScore = detailedMatchResult.score;
            enhancedMatchReasons = detailedMatchResult.reasons;
          }

          const isClaimedByCurrentUser = match.matchType === 'claimed';

          return {
            ...review,
            business_profile: businessProfile,
            reviewerAvatar: businessProfile?.avatar || '',
            reviewerName: businessProfile?.name || 'Anonymous Business',
            responses: [],
            matchType: isClaimedByCurrentUser ? 'claimed' : match.matchType,
            matchScore: isClaimedByCurrentUser ? 100 : enhancedMatchScore,
            matchReasons: isClaimedByCurrentUser ? ['Review claimed by your account'] : enhancedMatchReasons,
            detailedMatches: detailedMatches,
            isClaimed: isClaimedByCurrentUser,
            isEffectivelyClaimed: isClaimedByCurrentUser,
            hasUserResponded: userResponsesMap.has(review.id) || false
          };
        });

        // Format the reviews data
        const formattedReviews = reviewsWithProfiles.map(review =>
          formatReview(review, currentUser)
        );

        hookLogger.debug("=== REVIEW FETCH COMPLETE (React Query) ===");
        hookLogger.debug("Formatted reviews:", formattedReviews.length);
        return formattedReviews;

      } else {
        // For business users, use existing logic
        hookLogger.debug("🔍 Fetching reviews for business account...");

        const { data: businessReviews, error: businessError } = await supabase
          .from('reviews')
          .select(`
            id,
            customer_name,
            customer_nickname,
            customer_business_name,
            customer_address,
            customer_city,
            customer_state,
            customer_zipcode,
            customer_phone,
            associates,
            is_anonymous,
            rating,
            content,
            created_at,
            business_id,
            review_claims!left(claimed_by)
          `)
          .eq('business_id', currentUser.id)
          .order('created_at', { ascending: false });

        if (businessError) {
          hookLogger.error("Error fetching business reviews:", businessError);
          throw businessError;
        }

        // Add business profile data to business reviews
        const reviewsWithBusinessProfile = (businessReviews || []).map(review => ({
          id: review.id,
          rating: review.rating,
          content: review.content,
          date: review.created_at,
          customerName: review.customer_name,
          customer_name: review.customer_name,
          customer_nickname: review.customer_nickname,
          customer_business_name: review.customer_business_name,
          customer_address: review.customer_address,
          customer_city: review.customer_city,
          customer_state: review.customer_state,
          customer_zipcode: review.customer_zipcode,
          customer_phone: review.customer_phone,
          associates: review.associates || [],
          is_anonymous: review.is_anonymous || false,
          address: review.customer_address,
          city: review.customer_city,
          state: review.customer_state,
          zipCode: review.customer_zipcode,
          business_id: review.business_id,
          customerId: review.review_claims?.[0]?.claimed_by || null,
          reviewerAvatar: currentUser.avatar || '',
          reviewerName: currentUser.name || 'Business',
          business_profile: {
            name: currentUser.name,
            avatar: currentUser.avatar
          }
        }));

        hookLogger.debug("🔍 Business reviews fetched:", reviewsWithBusinessProfile.length);
        return reviewsWithBusinessProfile;
      }
    } catch (error) {
      hookLogger.error("Error fetching reviews:", error);
      toast({
        title: "Error",
        description: "Failed to fetch reviews.",
        variant: "destructive"
      });
      throw error;
    }
  };

  // React Query configuration
  const query = useQuery({
    queryKey: ['profileReviews', currentUser?.id],
    queryFn: fetchReviews,
    enabled: !!currentUser && !authLoading, // Only fetch when user is available
    staleTime: 5 * 60 * 1000, // 5 minutes - matches search cache duration
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
    refetchOnWindowFocus: false, // Don't refetch when user returns to tab
    refetchOnMount: false, // Don't refetch if data is fresh (this is the key!)
    retry: 1, // Retry once on failure
  });

  return {
    customerReviews: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch, // Manual refresh function
    isFetching: query.isFetching, // True during background refetch
  };
};
