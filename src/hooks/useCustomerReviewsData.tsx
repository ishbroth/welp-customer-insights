import { useState } from "react";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useCustomerReviewsData = () => {
  const { currentUser, isSubscribed, hasOneTimeAccess } = useAuth();
  const { toast } = useToast();
  const [expandedCustomerId, setExpandedCustomerId] = useState<string | null>(null);
  const [customerReviews, setCustomerReviews] = useState<{[key: string]: any[]}>({});

  const handleSelectCustomer = async (customerId: string) => {
    // Only allow expansion for signed-in users
    if (!currentUser) {
      return;
    }

    // If this customer is already expanded, collapse it
    if (expandedCustomerId === customerId) {
      setExpandedCustomerId(null);
      return;
    }

    // Otherwise, expand this customer
    setExpandedCustomerId(customerId);
    
    // Check if we already fetched reviews for this customer
    if (customerReviews[customerId]) {
      return;
    }
    
    try {
      let reviewsData = [];
      
      // If this is a review-based customer (ID starts with "review-customer-")
      if (customerId.startsWith('review-customer-')) {
        const actualReviewId = customerId.replace('review-customer-', '');
        
        // First get the specific review that this customer was found from
        const { data: reviewData, error: reviewError } = await supabase
          .from('reviews')
          .select(`
            id, 
            rating, 
            content, 
            created_at,
            business_id,
            customer_name,
            customer_phone,
            profiles!business_id(name, avatar)
          `)
          .eq('id', actualReviewId);
          
        if (reviewError) {
          throw reviewError;
        }
        
        if (reviewData && reviewData.length > 0) {
          const review = reviewData[0];
          
          // Find other reviews for same customer name
          const { data: similarReviews, error: similarError } = await supabase
            .from('reviews')
            .select(`
              id, 
              rating, 
              content, 
              created_at,
              business_id,
              profiles!business_id(name, avatar)
            `)
            .ilike('customer_name', `%${review.customer_name}%`)
            .order('created_at', { ascending: false });
            
          if (similarError) {
            throw similarError;
          }
          
          reviewsData = similarReviews || [];
        }
      } else {
        // This is a regular customer from profiles, fetch their reviews
        const { data, error } = await supabase
          .from('reviews')
          .select(`
            id, 
            rating, 
            content, 
            created_at,
            business_id,
            profiles!business_id(name, avatar)
          `)
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        reviewsData = data || [];
      }
      
      // Format reviews data - properly use business profile information
      const formattedReviews = reviewsData ? reviewsData.map(review => ({
        id: review.id,
        rating: review.rating,
        content: review.content,
        date: review.created_at,
        reviewerId: review.business_id,
        // Use the business profile name from the joined data
        reviewerName: review.profiles?.name || "Anonymous Business"
      })) : [];
      
      // Update state with fetched reviews
      setCustomerReviews(prev => ({
        ...prev,
        [customerId]: formattedReviews
      }));
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast({
        title: "Error",
        description: "Failed to fetch customer reviews.",
        variant: "destructive"
      });
      
      // Set empty array for this customer to prevent repeated fetch attempts
      setCustomerReviews(prev => ({
        ...prev,
        [customerId]: []
      }));
    }
  };

  // Check if user has access to the customer's full reviews
  const hasFullAccess = (customerId: string) => {
    // If the user is logged in and has a subscription, they have access
    if (currentUser && isSubscribed) return true;
    
    // If the user is an admin, they have access
    if (currentUser?.type === "admin") return true;
    
    // Check if the user has paid for one-time access to this specific customer
    return hasOneTimeAccess(customerId);
  };

  return {
    expandedCustomerId,
    customerReviews,
    handleSelectCustomer,
    hasFullAccess
  };
};
