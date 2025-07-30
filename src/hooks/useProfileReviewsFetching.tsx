
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { fetchBusinessProfile } from "@/services/businessProfileService";
import { formatReview } from "@/utils/reviewFormatter";
import { supabase } from "@/integrations/supabase/client";
import { useProfileReviewsMatching } from "./useProfileReviewsMatching";
import { useReviewMatching } from "./useReviewMatching";

export const useProfileReviewsFetching = () => {
  const { toast } = useToast();
  const { currentUser, loading: authLoading } = useAuth();
  const [customerReviews, setCustomerReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const { categorizeReviews } = useProfileReviewsMatching();
  const { checkReviewMatch } = useReviewMatching();

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
      
      // If user is a customer, use the new matching logic
      if (currentUser.type === "customer") {
        // First, fetch ALL claimed review IDs from ALL users' credit transactions
        console.log("🔍 Fetching all claimed reviews from credit transactions...");
        const { data: allClaimedReviews, error: allClaimedError } = await supabase
          .from('credit_transactions')
          .select('description, user_id')
          .eq('type', 'usage')
          .ilike('description', '%unlock%review%');
        
        if (allClaimedError) {
          console.error("Error fetching all claimed reviews:", allClaimedError);
        }
        
        // Extract review IDs claimed by OTHER users (not current user)
        const claimedByOthersIds = new Set();
        const claimedByCurrentUserIds = new Set();
        
        if (allClaimedReviews) {
          console.log("📋 Processing all claimed reviews:", allClaimedReviews);
          allClaimedReviews.forEach(transaction => {
            // Match pattern: "Unlocked review [uuid]"
            const match = transaction.description?.match(/unlocked review ([a-f0-9-]{36})/i);
            if (match) {
              if (transaction.user_id === currentUser.id) {
                claimedByCurrentUserIds.add(match[1]);
                console.log("✅ Found review claimed by current user:", match[1]);
              } else {
                claimedByOthersIds.add(match[1]);
                console.log("⚠️ Found review claimed by other user:", match[1]);
              }
            } else {
              console.log("❌ Could not extract review ID from:", transaction.description);
            }
          });
        }
        
        console.log("🔒 Reviews claimed by others:", Array.from(claimedByOthersIds));
        console.log("🎯 Reviews claimed by current user:", Array.from(claimedByCurrentUserIds));

        // Pass reviews claimed by OTHERS to exclude them from search
        const reviewMatches = await categorizeReviews(currentUser, Array.from(claimedByOthersIds) as string[]);
        console.log("📊 Total review matches (already filtered):", reviewMatches.length);
        
        // Sort reviews: claimed first, then high quality, then potential matches
        const sortedMatches = reviewMatches.sort((a, b) => {
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

        // Fetch business profiles for each review and generate detailed matches
        const reviewsWithProfiles = await Promise.all(
          sortedMatches.map(async (match) => {
            const review = match.review;
            let businessProfile = null;

            // Fetch business profile if business_id exists
            if (review.business_id) {
              try {
                businessProfile = await fetchBusinessProfile(review.business_id);
              } catch (error) {
                console.error(`Error fetching business profile for ${review.business_id}:`, error);
              }
            }

            // Generate detailed match information for non-claimed reviews
            let detailedMatches = [];
            if (match.matchType !== 'claimed') {
              const detailedMatchResult = checkReviewMatch(review, currentUser);
              detailedMatches = detailedMatchResult.detailedMatches;
            }

            // Check if this review was claimed by the current user
            const isClaimedByCurrentUser = claimedByCurrentUserIds.has(review.id);

            return {
              ...review,
              business_profile: businessProfile,
              // Ensure we have the business avatar from profile
              reviewerAvatar: businessProfile?.avatar || '',
              reviewerName: businessProfile?.name || review.customer_name || 'Business',
              responses: [],
              matchType: isClaimedByCurrentUser ? 'claimed' : match.matchType,
              matchScore: isClaimedByCurrentUser ? 100 : match.matchScore,
              matchReasons: isClaimedByCurrentUser ? ['Review claimed by your account'] : match.matchReasons,
              detailedMatches: detailedMatches,
              isClaimed: isClaimedByCurrentUser,
              hasUserResponded: userResponsesMap.has(review.id) || false
            };
          })
        );

        // Format the reviews data
        const formattedReviews = reviewsWithProfiles.map(review => 
          formatReview(review, currentUser)
        );

        setCustomerReviews(formattedReviews);
        console.log("=== REVIEW FETCH COMPLETE ===");
        console.log("Formatted reviews:", formattedReviews);
      } else {
        // For business users, use existing logic from the old file
        console.log("Fetching reviews for business account...");
        
        const { data: businessReviews, error: businessError } = await supabase
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
            business_id
          `)
          .eq('business_id', currentUser.id)
          .order('created_at', { ascending: false });

        if (businessError) {
          console.error("Error fetching business reviews:", businessError);
          return [];
        }

        // Add business profile data to business reviews
        const reviewsWithBusinessProfile = (businessReviews || []).map(review => ({
          id: review.id,
          rating: review.rating,
          content: review.content,
          created_at: review.created_at,
          customer_name: review.customer_name,
          customer_address: review.customer_address,
          customer_city: review.customer_city,
          customer_zipcode: review.customer_zipcode,
          customer_phone: review.customer_phone,
          business_id: review.business_id,
          reviewerAvatar: currentUser.avatar || '',
          reviewerName: currentUser.name || 'Business',
          business_profile: {
            name: currentUser.name,
            avatar: currentUser.avatar
          }
        }));

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
