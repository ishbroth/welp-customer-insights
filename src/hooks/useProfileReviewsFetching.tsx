
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { fetchCustomerReviewsFromDB } from "@/services/reviewsService";
import { fetchBusinessProfile } from "@/services/businessProfileService";
import { formatReview } from "@/utils/reviewFormatter";
import { supabase } from "@/integrations/supabase/client";

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
      let uniqueReviews;
      
      console.log("=== FETCHING REVIEWS FOR USER ===");
      console.log("User type:", currentUser.type);
      console.log("User ID:", currentUser.id);
      console.log("User name:", currentUser.name);
      
      // If user is a customer, fetch reviews written about them
      if (currentUser.type === "customer") {
        console.log("Fetching reviews for customer account...");
        
        // Try multiple approaches to find reviews for this customer
        const searchPromises = [];
        
        // 1. Search by customer_id
        searchPromises.push(
          supabase
            .from('reviews')
            .select('*')
            .eq('customer_id', currentUser.id)
            .order('created_at', { ascending: false })
        );
        
        // 2. Search by customer name if available
        if (currentUser.name) {
          searchPromises.push(
            supabase
              .from('reviews')
              .select('*')
              .ilike('customer_name', `%${currentUser.name}%`)
              .order('created_at', { ascending: false })
          );
        }
        
        // Execute all searches
        const searchResults = await Promise.allSettled(searchPromises);
        const allReviews = [];
        
        searchResults.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value.data) {
            console.log(`Search ${index + 1} found ${result.value.data.length} reviews`);
            allReviews.push(...result.value.data);
          } else if (result.status === 'rejected') {
            console.error(`Search ${index + 1} failed:`, result.reason);
          }
        });
        
        // Remove duplicates based on review ID
        uniqueReviews = allReviews.filter((review, index, self) => 
          index === self.findIndex(r => r.id === review.id)
        );
        
        console.log(`Total unique reviews found: ${uniqueReviews.length}`);
      } else {
        // For business users, use the existing logic
        console.log("Fetching reviews for business account...");
        uniqueReviews = await fetchCustomerReviewsFromDB(currentUser);
      }

      // Now fetch business profiles and responses for each review
      const reviewsWithProfilesAndResponses = await Promise.all(
        uniqueReviews.map(async (review) => {
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
              console.log(`Found ${responseData.length} responses for review ${review.id}`);
              
              // Get author information for each response
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
            responses: responses
          };
        })
      );

      console.log("Reviews with business profile and response data:", reviewsWithProfilesAndResponses);

      // Format the reviews data
      const formattedReviews = reviewsWithProfilesAndResponses.map(review => 
        formatReview(review, currentUser)
      );

      setCustomerReviews(formattedReviews);
      console.log("=== REVIEW FETCH COMPLETE ===");
      console.log("Formatted reviews:", formattedReviews);
      
      if (formattedReviews.length === 0) {
        console.log("No reviews found. This could mean:");
        console.log("1. No businesses have reviewed this customer yet");
        console.log("2. Reviews exist but customer_id/name matching failed");
        console.log("3. Reviews are in the database but not properly linked");
      } else {
        // Log which reviews have responses
        formattedReviews.forEach(review => {
          if (review.responses && review.responses.length > 0) {
            console.log(`Review ${review.id} has ${review.responses.length} responses from customers`);
          }
        });
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
