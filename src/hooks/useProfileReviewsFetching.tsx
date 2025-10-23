
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { fetchBusinessProfile } from "@/services/businessProfileService";
import { formatReview } from "@/utils/reviewFormatter";
import { supabase } from "@/integrations/supabase/client";
import { useProfileReviewsMatching } from "./useProfileReviewsMatching";
import { useReviewMatching } from "./useReviewMatching";
import { useReviewClaims } from "./useReviewClaims";
import { logger } from '@/utils/logger';
import { safeGetItem, safeSetItem, safeRemoveItem } from '@/utils/safeLocalStorage';

const hookLogger = logger.withContext('ProfileReviewsFetching');

export const useProfileReviewsFetching = () => {
  const { toast } = useToast();
  const { currentUser, loading: authLoading } = useAuth();
  const [customerReviews, setCustomerReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const { categorizeReviews } = useProfileReviewsMatching();
  const { checkReviewMatch } = useReviewMatching();
  const { getUserClaimedReviews } = useReviewClaims();

  const getCacheKey = (userId: string) => `profileReviews_${userId}`;

  const fetchCustomerReviews = async (forceRefresh: boolean = false) => {
    // Don't fetch if auth is still loading or user is not available
    if (authLoading || !currentUser) {
      hookLogger.debug("⏳ Skipping review fetch - auth loading:", authLoading, "currentUser:", !!currentUser);
      setIsLoading(authLoading);
      return;
    }

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cacheKey = getCacheKey(currentUser.id);
      const cachedData = safeGetItem(cacheKey, sessionStorage);

      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData);
          hookLogger.debug("✅ Using cached review data");
          setCustomerReviews(parsed);
          setIsLoading(false);
          return;
        } catch (e) {
          hookLogger.error("Error parsing cached data:", e);
          safeRemoveItem(cacheKey, sessionStorage);
        }
      }
    }

    setIsLoading(true);
    
    try {
      hookLogger.debug("=== FETCHING REVIEWS FOR USER ===");
      hookLogger.debug("Auth loading:", authLoading);
      hookLogger.debug("User type:", currentUser.type);
      hookLogger.debug("User ID:", currentUser.id);
      hookLogger.debug("User email:", currentUser.email);
      
        // If user is a customer, use the new global claims system
        if (currentUser.type === "customer") {
          hookLogger.debug("🔍 Starting review search for customer...");
          
          // SEARCH 1: Find potential matches from reviews NOT claimed by other users
          // This allows showing fuzzy matches while preventing duplicate claims
          const potentialMatches = await categorizeReviews(currentUser);
          hookLogger.debug("📊 Potential review matches found (before filtering claimed by others):", potentialMatches.length);

          // Filter out reviews that have been claimed by OTHER users (not current user)
          // Get all claimed review IDs by OTHER users
          const { data: otherUserClaims, error: claimsError } = await supabase
            .from('review_claims')
            .select('review_id, claimed_by')
            .neq('claimed_by', currentUser.id);

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
          hookLogger.debug("📊 Unclaimed review matches (after filtering):", unclaimedMatches.length);
          
          // SEARCH 2: Get reviews claimed by current user using new system
          const claimedReviews = await getUserClaimedReviews();
          hookLogger.debug("✅ Found claimed reviews for current user:", claimedReviews.length);
          
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

          // Get all review IDs for response checking
          const reviewIds = sortedMatches.map(match => match.review.id);
          
          // Fetch responses to determine which reviews the current user has responded to
          let userResponsesMap = new Map();
          if (reviewIds.length > 0) {
            try {
              const { data: responses } = await supabase
                .from('responses')
                .select('review_id, author_id')
                .in('review_id', reviewIds)
                .eq('author_id', currentUser.id);
              
              if (responses) {
                responses.forEach(response => {
                  userResponsesMap.set(response.review_id, true);
                });
              }
            } catch (error) {
              hookLogger.error('Error fetching user responses:', error);
            }
          }

          // PERFORMANCE OPTIMIZATION: Batch fetch all unique business profiles in a single query
          const uniqueBusinessIds = [...new Set(sortedMatches.map(m => m.review.business_id).filter(Boolean))];
          const businessProfilesMap = new Map();

          hookLogger.info('=== BUSINESS PROFILE FETCH DEBUG ===');
          hookLogger.info('Total reviews to process:', sortedMatches.length);
          hookLogger.info('Unique business IDs to fetch:', uniqueBusinessIds);
          sortedMatches.forEach(m => {
            hookLogger.info(`Review ${m.review.id}: business_id = "${m.review.business_id}", business_id type = ${typeof m.review.business_id}`);
          });
          hookLogger.info('Query to execute: SELECT id, name, avatar, verified, type FROM profiles WHERE id IN', uniqueBusinessIds);

          if (uniqueBusinessIds.length > 0) {
            try {
              hookLogger.debug('Fetching business profiles for IDs:', uniqueBusinessIds);

              // Fetch from profiles table (primary source for all users)
              hookLogger.info('Executing profiles query with IDs:', uniqueBusinessIds);
              const { data: profiles, error: profilesError } = await supabase
                .from('profiles')
                .select('id, name, avatar, verified, type')
                .in('id', uniqueBusinessIds);

              hookLogger.info('Query response:', {
                profilesCount: profiles?.length || 0,
                profiles: profiles,
                error: profilesError,
                errorCode: profilesError?.code,
                errorMessage: profilesError?.message,
                errorDetails: profilesError?.details
              });

              if (profilesError) {
                hookLogger.error('Error batch fetching profiles:', profilesError);
                hookLogger.error('Error details:', {
                  code: profilesError.code,
                  message: profilesError.message,
                  details: profilesError.details,
                  hint: profilesError.hint
                });
              } else if (profiles && profiles.length > 0) {
                hookLogger.info('Found profiles from profiles table:', profiles);
                profiles.forEach(profile => {
                  hookLogger.info(`Profile ${profile.id}: name="${profile.name}", type="${profile.type}"`);
                  businessProfilesMap.set(profile.id, {
                    id: profile.id,
                    name: profile.name,
                    avatar: profile.avatar,
                    verified: profile.verified || false,
                    business_category: null
                  });
                });
              } else {
                hookLogger.warn('NO PROFILES FOUND in profiles table! Query returned empty array.');
                hookLogger.warn('This means the profile does not exist in the database.');
              }

              // Then try to enhance with business_profiles data if available
              const { data: businessProfiles, error: businessError } = await supabase
                .from('business_profiles')
                .select('id, name, avatar, verified, business_category')
                .in('id', uniqueBusinessIds);

              if (businessError) {
                hookLogger.debug('No business_profiles found (this is normal):', businessError.message);
              } else if (businessProfiles) {
                // Enhance existing profiles with business_profiles data
                businessProfiles.forEach(businessProfile => {
                  const existing = businessProfilesMap.get(businessProfile.id);
                  if (existing) {
                    businessProfilesMap.set(businessProfile.id, {
                      ...existing,
                      ...businessProfile // Override with business_profiles data if available
                    });
                  }
                });
              }

              hookLogger.debug('Final business profiles map:', Array.from(businessProfilesMap.entries()));
            } catch (error) {
              hookLogger.error('Error in batch profile fetch:', error);
            }
          }

          // Generate detailed matches and map business profiles
          const reviewsWithProfiles = sortedMatches.map((match) => {
            const review = match.review;
            const businessProfile = review.business_id ? businessProfilesMap.get(review.business_id) : null;

            // Generate detailed match information for all reviews (both claimed and unclaimed)
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

            // Check if this review was claimed by the current user (already handled in data structure)
            const isClaimedByCurrentUser = match.matchType === 'claimed';

            hookLogger.debug(`Review ${review.id} business profile:`, {
              businessProfileId: review.business_id,
              businessProfileFound: !!businessProfile,
              businessProfileName: businessProfile?.name,
              reviewerNameToUse: businessProfile?.name || 'Anonymous Business'
            });

            return {
              ...review,
              business_profile: businessProfile,
              // Ensure we have the business avatar from profile
              reviewerAvatar: businessProfile?.avatar || '',
              // IMPORTANT: Use business profile name, NOT customer name as fallback
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

          // Cache the results (safely)
          const cacheKey = getCacheKey(currentUser.id);
          safeSetItem(cacheKey, JSON.stringify(formattedReviews), sessionStorage);

          setCustomerReviews(formattedReviews);
          hookLogger.debug("=== DUAL SEARCH COMPLETE ===");
          hookLogger.debug("Formatted reviews:", formattedReviews);
      } else {
        // For business users, use existing logic from the old file
        hookLogger.debug("🔍 PROFILE FETCHING - Fetching reviews for business account...");
        
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
          return [];
        }

        hookLogger.debug("🔍 PROFILE FETCHING - Raw business reviews:", businessReviews);
        hookLogger.debug("🔍 PROFILE FETCHING - First review nickname:", businessReviews?.[0]?.customer_nickname);
        hookLogger.debug("🔍 PROFILE FETCHING - First review business name:", businessReviews?.[0]?.customer_business_name);
        hookLogger.debug("🔍 PROFILE FETCHING - First review is_anonymous:", businessReviews?.[0]?.is_anonymous);

        // Add business profile data to business reviews
        const reviewsWithBusinessProfile = (businessReviews || []).map(review => ({
          id: review.id,
          rating: review.rating,
          content: review.content,
          date: review.created_at,
          customerName: review.customer_name, // Map to camelCase for component compatibility
          customer_name: review.customer_name, // Keep snake_case for backward compatibility
          customer_nickname: review.customer_nickname, // Include nickname field
          customer_business_name: review.customer_business_name, // Include business name field
          customer_address: review.customer_address,
          customer_city: review.customer_city,
          customer_state: review.customer_state,
          customer_zipcode: review.customer_zipcode,
          customer_phone: review.customer_phone,
          associates: review.associates || [],
          is_anonymous: review.is_anonymous || false,
          // Map to camelCase for component compatibility
          address: review.customer_address,
          city: review.customer_city,
          state: review.customer_state,
          zipCode: review.customer_zipcode,
          business_id: review.business_id,
          // Include customerId from review claims if available
          customerId: review.review_claims?.[0]?.claimed_by || null,
          reviewerAvatar: currentUser.avatar || '',
          reviewerName: currentUser.name || 'Business',
          business_profile: {
            name: currentUser.name,
            avatar: currentUser.avatar
          }
        }));

        hookLogger.debug("🔍 PROFILE FETCHING - Transformed reviews:", reviewsWithBusinessProfile);
        hookLogger.debug("🔍 PROFILE FETCHING - First transformed review:", reviewsWithBusinessProfile?.[0]);

        // Cache the results (safely)
        const cacheKey = getCacheKey(currentUser.id);
        safeSetItem(cacheKey, JSON.stringify(reviewsWithBusinessProfile), sessionStorage);

        setCustomerReviews(reviewsWithBusinessProfile);
      }
    } catch (error) {
      hookLogger.error("Error fetching reviews:", error);
      toast({
        title: "Error",
        description: "Failed to fetch reviews.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced useEffect with proper authentication state handling
  useEffect(() => {
    hookLogger.debug("🔄 useEffect triggered - authLoading:", authLoading, "currentUser:", !!currentUser, "isInitialized:", isInitialized);
    
    // Case 1: Auth is still loading - wait
    if (authLoading) {
      hookLogger.debug("⏳ Auth still loading, waiting...");
      setIsLoading(true);
      return;
    }
    
    // Case 2: Auth completed but no user - clear data and stop loading
    if (!authLoading && !currentUser) {
      hookLogger.debug("❌ No user found after auth completion");
      setCustomerReviews([]);
      setIsLoading(false);
      setIsInitialized(true);
      return;
    }
    
    // Case 3: User is available and auth is complete
    if (!authLoading && currentUser) {
      hookLogger.debug("✅ User available, fetching reviews");
      // Only fetch if we haven't initialized yet, or if the user has changed
      if (!isInitialized) {
        setIsInitialized(true);
        fetchCustomerReviews();
      } else {
        // User changed, fetch again
        fetchCustomerReviews();
      }
    }
  }, [currentUser, authLoading]);

  return { customerReviews, isLoading, fetchCustomerReviews };
};
