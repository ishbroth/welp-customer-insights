
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

        // Fetch business profiles and responses for each review
        const reviewsWithProfilesAndResponses = await Promise.all(
          sortedMatches.map(async (match) => {
            const review = match.review;
            let businessProfile = null;
            let responses = [];

            // Fetch business profile if business_id exists
            if (review.business_id) {
              try {
                businessProfile = await fetchBusinessProfile(review.business_id);
              } catch (error) {
                console.error(`Error fetching business profile for ${review.business_id}:`, error);
              }
            }

            // Fetch responses for this review
            try {
              const { data: responseData, error: responseError } = await supabase
                .from('responses')
                .select('id, author_id, content, created_at')
                .eq('review_id', review.id)
                .order('created_at', { ascending: true });

              if (!responseError && responseData && responseData.length > 0) {
                const authorIds = responseData.map(r => r.author_id).filter(Boolean);
                
                if (authorIds.length > 0) {
                  const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('id, name, first_name, last_name')
                    .in('id', authorIds);

                  if (!profileError && profileData) {
                    responses = responseData.map((resp: any) => {
                      const profile = profileData.find(p => p.id === resp.author_id);
                      const authorName = profile?.name || 
                                       (profile?.first_name && profile?.last_name 
                                         ? `${profile.first_name} ${profile.last_name}` 
                                         : 'User');

                      return {
                        id: resp.id,
                        authorId: resp.author_id || '',
                        authorName,
                        content: resp.content,
                        createdAt: resp.created_at
                      };
                    });
                  }
                }
              }
            } catch (error) {
              console.error(`Error fetching responses for review ${review.id}:`, error);
            }

            return {
              ...review,
              business_profile: businessProfile,
              responses: responses,
              matchType: match.matchType,
              matchScore: match.matchScore,
              matchReasons: match.matchReasons,
              isClaimed: match.matchType === 'claimed'
            };
          })
        );

        // Format the reviews data
        const formattedReviews = reviewsWithProfilesAndResponses.map(review => 
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

        setCustomerReviews(businessReviews || []);
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
