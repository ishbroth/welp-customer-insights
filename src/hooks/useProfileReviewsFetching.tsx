
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { fetchBusinessProfile } from "@/services/businessProfileService";
import { formatReview } from "@/utils/reviewFormatter";
import { supabase } from "@/integrations/supabase/client";
import { useProfileReviewsMatching } from "./useProfileReviewsMatching";

export const useProfileReviewsFetching = () => {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [customerReviews, setCustomerReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { categorizeReviews } = useProfileReviewsMatching();

  const fetchCustomerReviews = async () => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    try {
      console.log("=== FETCHING REVIEWS FOR USER ===");
      console.log("User type:", currentUser.type);
      console.log("User ID:", currentUser.id);
      
      // If user is a customer, use the new matching logic
      if (currentUser.type === "customer") {
        const reviewMatches = await categorizeReviews(currentUser);
        
        // Sort reviews: claimed first, then high quality, then potential matches
        const sortedMatches = reviewMatches.sort((a, b) => {
          if (a.matchType === 'claimed' && b.matchType !== 'claimed') return -1;
          if (a.matchType !== 'claimed' && b.matchType === 'claimed') return 1;
          if (a.matchType === 'high_quality' && b.matchType === 'potential') return -1;
          if (a.matchType === 'potential' && b.matchType === 'high_quality') return 1;
          return b.matchScore - a.matchScore;
        });

        // Fetch business profiles for each review
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

            return {
              ...review,
              business_profile: businessProfile,
              // Ensure we have the business avatar from profile
              reviewerAvatar: businessProfile?.avatar || '',
              reviewerName: businessProfile?.name || review.customer_name || 'Business',
              responses: [],
              matchType: match.matchType,
              matchScore: match.matchScore,
              matchReasons: match.matchReasons,
              isClaimed: match.matchType === 'claimed'
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

  useEffect(() => {
    fetchCustomerReviews();
  }, [currentUser]);

  return { customerReviews, isLoading, fetchCustomerReviews };
};
