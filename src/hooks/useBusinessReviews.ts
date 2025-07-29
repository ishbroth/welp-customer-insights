
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { Review } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useBusinessReviews = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [workingReviews, setWorkingReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBusinessReviews = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    
    try {
      // Fetch reviews written by this business (not soft deleted)
      const { data: reviewsData, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          content,
          created_at,
          customer_id,
          customer_name,
          customer_address,
          customer_city,
          customer_zipcode,
          customer_phone
        `)
        .eq('business_id', currentUser.id)
        .is('deleted_at', null) // Only get non-deleted reviews
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      console.log("BusinessReviews: Found reviews:", reviewsData?.length || 0);

      // Fetch responses for each review
      const reviewsWithResponses = await Promise.all(
        (reviewsData || []).map(async (review) => {
          let responses = [];

          try {
            const { data: responseData, error: responseError } = await supabase
              .from('responses')
              .select('id, author_id, content, created_at')
              .eq('review_id', review.id)
              .order('created_at', { ascending: true });

            if (!responseError && responseData && responseData.length > 0) {
              console.log(`BusinessReviews: Found ${responseData.length} responses for review ${review.id}`);
              
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
                                       : 'Customer');

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
            responses: responses
          };
        })
      );

      // Format reviews data to match Review type
      const formattedReviews = reviewsWithResponses.map(review => ({
        id: review.id,
        reviewerId: currentUser.id,
        reviewerName: currentUser.name || "Anonymous Business",
        reviewerAvatar: currentUser.avatar,
        customerId: review.customer_id || '',
        customerName: review.customer_name || "Anonymous Customer",
        rating: review.rating,
        content: review.content,
        date: review.created_at,
        // Map database fields correctly to Review interface
        address: review.customer_address || "",
        city: review.customer_city || "",
        zipCode: review.customer_zipcode || "",
        // Store phone in a custom field since Review interface doesn't have it
        phone: review.customer_phone || "",
        reactions: { like: [], funny: [], useful: [], ohNo: [] },
        responses: review.responses || []
      }));

      setWorkingReviews(formattedReviews);
      
      console.log("BusinessReviews: Formatted reviews with responses:", formattedReviews);
      
      if (reviewsData && reviewsData.length > 0) {
        const responsesCount = formattedReviews.reduce((acc, review) => acc + (review.responses?.length || 0), 0);
        toast({
          title: "Reviews Loaded",
          description: `Found ${reviewsData.length} reviews${responsesCount > 0 ? ` with ${responsesCount} customer responses` : ''}.`,
        });
      }
      
    } catch (error) {
      console.error("Error fetching business reviews:", error);
      toast({
        title: "Error",
        description: "There was an error fetching your reviews. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch reviews from database
  useEffect(() => {
    if (currentUser) {
      fetchBusinessReviews();
    }
  }, [currentUser]);

  return {
    workingReviews,
    setWorkingReviews,
    isLoading,
    fetchBusinessReviews
  };
};
