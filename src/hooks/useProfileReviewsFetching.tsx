
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { fetchBusinessProfile } from "@/services/businessProfileService";
import { formatReview } from "@/utils/reviewFormatter";
import { supabase } from "@/integrations/supabase/client";
import { useProfileReviewsMatching } from "./useProfileReviewsMatching";
import { useReviewMatching } from "./useReviewMatching";
import { useReviewClaims } from "./useReviewClaims";

export const useProfileReviewsFetching = () => {
  const { toast } = useToast();
  const { currentUser, loading: authLoading } = useAuth();
  const [customerReviews, setCustomerReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const { categorizeReviews } = useProfileReviewsMatching();
  const { checkReviewMatch } = useReviewMatching();
  const { getUserClaimedReviews } = useReviewClaims();

  const fetchCustomerReviews = async () => {
    // Don't fetch if auth is still loading or user is not available
    if (authLoading || !currentUser) {
      console.log("⏳ Skipping review fetch - auth loading:", authLoading, "currentUser:", !!currentUser);
      setIsLoading(authLoading);
      return;
    }

    setIsLoading(true);
    
    try {
      console.log("=== FETCHING REVIEWS FOR USER ===");
      console.log("Auth loading:", authLoading);
      console.log("User type:", currentUser.type);
      console.log("User ID:", currentUser.id);
      console.log("User email:", currentUser.email);
      
        // If user is a customer, use the new global claims system
        if (currentUser.type === "customer") {
          console.log("🔍 Starting review search for customer...");
          
          // SEARCH 1: Find potential matches from unclaimed reviews only
          const unclaimedMatches = await categorizeReviews(currentUser);
          console.log("📊 Unclaimed review matches found:", unclaimedMatches.length);
          
          // SEARCH 2: Get reviews claimed by current user using new system
          const claimedReviews = await getUserClaimedReviews();
          console.log("✅ Found claimed reviews for current user:", claimedReviews.length);
          
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
          console.log("📋 Total combined results:", allMatches.length);
          
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
              console.error('Error fetching user responses:', error);
            }
          }

          // PERFORMANCE OPTIMIZATION: Batch fetch all unique business profiles in a single query
          const uniqueBusinessIds = [...new Set(sortedMatches.map(m => m.review.business_id).filter(Boolean))];
          const businessProfilesMap = new Map();

          if (uniqueBusinessIds.length > 0) {
            try {
              const { data: profiles, error } = await supabase
                .from('business_profiles')
                .select('id, name, avatar, verified, business_category')
                .in('id', uniqueBusinessIds);

              if (error) {
                console.error('Error batch fetching business profiles:', error);
              } else if (profiles) {
                profiles.forEach(profile => {
                  businessProfilesMap.set(profile.id, profile);
                });
              }
            } catch (error) {
              console.error('Error in batch profile fetch:', error);
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

            return {
              ...review,
              business_profile: businessProfile,
              // Ensure we have the business avatar from profile
              reviewerAvatar: businessProfile?.avatar || '',
              reviewerName: businessProfile?.name || review.customer_name || 'Business',
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

          setCustomerReviews(formattedReviews);
          console.log("=== DUAL SEARCH COMPLETE ===");
          console.log("Formatted reviews:", formattedReviews);
      } else {
        // For business users, use existing logic from the old file
        console.log("🔍 PROFILE FETCHING - Fetching reviews for business account...");
        
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
          console.error("Error fetching business reviews:", businessError);
          return [];
        }

        console.log("🔍 PROFILE FETCHING - Raw business reviews:", businessReviews);
        console.log("🔍 PROFILE FETCHING - First review nickname:", businessReviews?.[0]?.customer_nickname);
        console.log("🔍 PROFILE FETCHING - First review business name:", businessReviews?.[0]?.customer_business_name);
        console.log("🔍 PROFILE FETCHING - First review is_anonymous:", businessReviews?.[0]?.is_anonymous);

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

        console.log("🔍 PROFILE FETCHING - Transformed reviews:", reviewsWithBusinessProfile);
        console.log("🔍 PROFILE FETCHING - First transformed review:", reviewsWithBusinessProfile?.[0]);

        setCustomerReviews(reviewsWithBusinessProfile);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
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
    console.log("🔄 useEffect triggered - authLoading:", authLoading, "currentUser:", !!currentUser, "isInitialized:", isInitialized);
    
    // Case 1: Auth is still loading - wait
    if (authLoading) {
      console.log("⏳ Auth still loading, waiting...");
      setIsLoading(true);
      return;
    }
    
    // Case 2: Auth completed but no user - clear data and stop loading
    if (!authLoading && !currentUser) {
      console.log("❌ No user found after auth completion");
      setCustomerReviews([]);
      setIsLoading(false);
      setIsInitialized(true);
      return;
    }
    
    // Case 3: User is available and auth is complete
    if (!authLoading && currentUser) {
      console.log("✅ User available, fetching reviews");
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
