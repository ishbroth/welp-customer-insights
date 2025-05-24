
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Review } from "@/types";

export const useProfileReviewsFetching = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [customerReviews, setCustomerReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Function to fetch customer reviews based on profile information
  const fetchCustomerReviews = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    
    try {
      console.log("=== FETCHING CUSTOMER REVIEWS ===");
      console.log("Current user:", currentUser);
      
      // First, try to fetch reviews by customer_id
      const { data: directReviews, error: directError } = await supabase
        .from('reviews')
        .select(`
          id, 
          rating, 
          content, 
          created_at,
          business_id,
          profiles!business_id(name, avatar)
        `)
        .eq('customer_id', currentUser.id);
      
      if (directError) {
        console.error("Error fetching direct reviews:", directError);
      }
      
      console.log("Direct reviews found:", directReviews?.length || 0);
      
      let allReviews = directReviews || [];
      
      // If no direct reviews found and user has a name, also search by customer_name
      if ((!directReviews || directReviews.length === 0) && currentUser.name) {
        console.log("Searching for reviews by customer name:", currentUser.name);
        
        const { data: nameReviews, error: nameError } = await supabase
          .from('reviews')
          .select(`
            id, 
            rating, 
            content, 
            created_at,
            business_id,
            customer_name,
            profiles!business_id(name, avatar)
          `)
          .ilike('customer_name', `%${currentUser.name}%`);
        
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
      
      console.log("Total unique reviews found:", uniqueReviews.length);
      
      // Format reviews data to match Review type
      const formattedReviews = uniqueReviews.map(review => ({
        id: review.id,
        rating: review.rating,
        content: review.content,
        date: review.created_at,
        reviewerId: review.business_id,
        reviewerName: review.profiles?.name || "Anonymous Business",
        reviewerAvatar: review.profiles?.avatar || "",
        customerId: currentUser.id,
        customerName: currentUser.name || "Anonymous Customer",
        reactions: { like: [], funny: [], useful: [], ohNo: [] },
        responses: []
      }));
      
      setCustomerReviews(formattedReviews);
      
      if (formattedReviews.length > 0) {
        // Show a toast to inform the user
        toast({
          title: "Reviews Loaded",
          description: `Found ${formattedReviews.length} reviews about you.`,
        });
      } else {
        // Show a toast for no reviews
        toast({
          title: "No Reviews Found",
          description: "We couldn't find any reviews that match your profile information.",
        });
      }
      
      console.log("=== REVIEW FETCH COMPLETE ===");
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching customer reviews:", error);
      toast({
        title: "Error",
        description: "There was an error fetching your reviews. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  // Automatically fetch reviews based on customer profile info when component mounts
  useEffect(() => {
    if (currentUser && currentUser.type === "customer") {
      fetchCustomerReviews();
    }
  }, [currentUser]);

  return {
    customerReviews,
    isLoading,
    fetchCustomerReviews
  };
};
