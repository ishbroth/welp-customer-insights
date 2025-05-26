
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

export const useProfileReviewsFetching = () => {
  const { toast } = useToast();
  const { currentUser, isSubscribed } = useAuth();
  const [customerReviews, setCustomerReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCustomerReviews = async () => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    try {
      console.log("=== FETCHING REVIEWS FOR CUSTOMER ===");
      console.log("Customer ID:", currentUser.id);
      
      // First try to fetch by customer_id with proper join
      const { data: directReviews, error: directError } = await supabase
        .from('reviews')
        .select(`
          id, 
          rating, 
          content, 
          created_at,
          business_id,
          business_profile:profiles!inner(name, avatar)
        `)
        .eq('customer_id', currentUser.id)
        .eq('profiles.id', supabase.rpc('business_id'));

      if (directError) {
        console.error("Error fetching direct reviews:", directError);
      }

      console.log("Direct reviews found:", directReviews?.length || 0);
      let allReviews = directReviews || [];

      // If no direct reviews and we have a current user with a name, search by name
      if ((!directReviews || directReviews.length === 0) && currentUser?.name) {
        console.log("Searching by customer name:", currentUser.name);
        
        const { data: nameReviews, error: nameError } = await supabase
          .from('reviews')
          .select(`
            id, 
            rating, 
            content, 
            created_at,
            business_id,
            business_profile:profiles!inner(name, avatar)
          `)
          .ilike('customer_name', `%${currentUser.name}%`)
          .eq('profiles.id', supabase.rpc('business_id'));

        if (nameError) {
          console.error("Error fetching reviews by name:", nameError);
        } else {
          console.log("Reviews found by name:", nameReviews?.length || 0);
          allReviews = [...allReviews, ...(nameReviews || [])];
        }
      }

      // Remove duplicates based on review ID
      const uniqueReviews = allReviews.filter((review, index, self) => 
        index === self.findIndex(r => r.id === review.id)
      );

      console.log("Total unique reviews:", uniqueReviews.length);
      console.log("Reviews with business profile data:", uniqueReviews);

      // Format the reviews data
      const formattedReviews = uniqueReviews.map(review => {
        const businessProfile = review.business_profile;
        console.log("Business profile for review:", review.id, businessProfile);
        
        return {
          id: review.id,
          rating: review.rating,
          content: review.content,
          date: review.created_at,
          reviewerId: review.business_id,
          // Use the business profile name and avatar from the join
          reviewerName: businessProfile?.name || "Anonymous Business",
          reviewerAvatar: businessProfile?.avatar || "",
          customerId: currentUser.id,
          customerName: currentUser.name || "Anonymous Customer",
          reactions: { like: [], funny: [], useful: [], ohNo: [] },
          responses: []
        };
      });

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
