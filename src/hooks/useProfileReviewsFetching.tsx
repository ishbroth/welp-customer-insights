
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { fetchCustomerReviewsFromDB } from "@/services/reviewsService";
import { fetchBusinessProfile } from "@/services/businessProfileService";
import { formatReview } from "@/utils/reviewFormatter";

export const useProfileReviewsFetching = () => {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [customerReviews, setCustomerReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCustomerReviews = async () => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    try {
      // Fetch reviews from database
      const uniqueReviews = await fetchCustomerReviewsFromDB(currentUser);

      // Now fetch business profiles for each review
      const reviewsWithProfiles = await Promise.all(
        uniqueReviews.map(async (review) => {
          if (review.business_id) {
            const businessProfile = await fetchBusinessProfile(review.business_id);
            return {
              ...review,
              business_profile: businessProfile
            };
          }
          return {
            ...review,
            business_profile: null
          };
        })
      );

      console.log("Reviews with business profile data:", reviewsWithProfiles);

      // Format the reviews data
      const formattedReviews = reviewsWithProfiles.map(review => 
        formatReview(review, currentUser)
      );

      setCustomerReviews(formattedReviews);
      console.log("=== REVIEW FETCH COMPLETE ===");
      console.log("Formatted reviews:", formattedReviews);
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
