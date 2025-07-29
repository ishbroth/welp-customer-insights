
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { fetchBusinessProfile } from "@/services/businessProfileService";
import { formatReview } from "@/utils/reviewFormatter";
import { supabase } from "@/integrations/supabase/client";
import { useProfileReviewsMatching } from "./useProfileReviewsMatching.ts";

export const useProfileReviewsFetching = () => {
  const { toast } = useToast();
  const { currentUser, loading: authLoading } = useAuth();
  const [permanentReviews, setPermanentReviews] = useState<any[]>([]);
  const [potentialMatches, setPotentialMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const { categorizeReviews } = useProfileReviewsMatching();

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
        const reviewsData = await categorizeReviews(currentUser);
        
        // Handle the structure properly - check if it's the new object format
        const permanentReviewsArray = (reviewsData as any).permanentReviews || [];
        const potentialMatchesArray = (reviewsData as any).potentialMatches || [];
        
        // Process permanent reviews
        const processedPermanentReviews = await Promise.all(
          permanentReviewsArray.map(async (match) => {
            const review = match.review;
            let businessProfile = null;

            if (review.business_id) {
              try {
                businessProfile = await fetchBusinessProfile(review.business_id);
              } catch (error) {
                console.error(`Error fetching business profile for ${review.business_id}:`, error);
              }
            }

            return {
              ...review,
              business_profile: businessProfile,
              reviewerAvatar: businessProfile?.avatar || '',
              reviewerName: businessProfile?.name || review.customer_name || 'Business',
              responses: review.responses || [],
              matchType: match.matchType,
              matchScore: match.matchScore,
              matchReasons: match.matchReasons,
              isClaimed: match.matchType === 'claimed',
              isPermanent: true
            };
          })
        );

        // Process potential matches
        const processedPotentialMatches = await Promise.all(
          potentialMatchesArray.map(async (match) => {
            const review = match.review;
            let businessProfile = null;

            if (review.business_id) {
              try {
                businessProfile = await fetchBusinessProfile(review.business_id);
              } catch (error) {
                console.error(`Error fetching business profile for ${review.business_id}:`, error);
              }
            }

            return {
              ...review,
              business_profile: businessProfile,
              reviewerAvatar: businessProfile?.avatar || '',
              reviewerName: businessProfile?.name || review.customer_name || 'Business',
              responses: review.responses || [],
              matchType: match.matchType,
              matchScore: match.matchScore,
              matchReasons: match.matchReasons,
              isClaimed: false,
              isPermanent: false
            };
          })
        );

        // Format the reviews data
        const formattedPermanentReviews = processedPermanentReviews.map(review => 
          formatReview(review, currentUser)
        );
        const formattedPotentialMatches = processedPotentialMatches.map(review => 
          formatReview(review, currentUser)
        );

        setPermanentReviews(formattedPermanentReviews);
        setPotentialMatches(formattedPotentialMatches);
        console.log("=== REVIEW FETCH COMPLETE ===");
        console.log("Permanent reviews:", formattedPermanentReviews.length, "Potential matches:", formattedPotentialMatches.length);
      } else {
        // For business users, use existing logic from the old file
        console.log("Fetching reviews for business account...");
        
        const { data: businessReviews, error: businessError } = await supabase
          .from('reviews')
          .select(`
            id,
            customer_id,
            customer_name,
            customer_address,
            customer_city,
            customer_zipcode,
            customer_phone,
            rating,
            content,
            created_at
          `)
          .eq('business_id', currentUser.id)
          .order('created_at', { ascending: false });

        if (businessError) {
          console.error("Error fetching business reviews:", businessError);
          return [];
        }

        // Add business profile data to business reviews
        const reviewsWithBusinessProfile = (businessReviews || []).map(review => ({
          ...review,
          reviewerAvatar: currentUser.avatar || '',
          reviewerName: currentUser.name || 'Business',
          business_profile: {
            name: currentUser.name,
            avatar: currentUser.avatar
          }
        }));

        // For business users, all reviews go to potential matches (keeping existing behavior)
        setPermanentReviews([]);
        setPotentialMatches(reviewsWithBusinessProfile);
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
      setPermanentReviews([]);
      setPotentialMatches([]);
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

  return { permanentReviews, potentialMatches, isLoading, fetchCustomerReviews };
};
