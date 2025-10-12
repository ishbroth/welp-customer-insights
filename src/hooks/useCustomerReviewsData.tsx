import { useState } from "react";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

export const useCustomerReviewsData = () => {
  const hookLogger = logger.withContext('CustomerReviewsData');
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
            customer_phone
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
              business_id
            `)
            .ilike('customer_name', `%${review.customer_name}%`)
            .order('created_at', { ascending: false });
            
          if (similarError) {
            throw similarError;
          }
          
          reviewsData = similarReviews || [];
        }
      } else {
        // This is a regular customer from profiles, fetch their reviews by customer name
        // First get the customer name from profiles
        const { data: customerData } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', customerId)
          .single();
          
        if (customerData?.name) {
          const { data, error } = await supabase
            .from('reviews')
            .select(`
              id, 
              rating, 
              content, 
              created_at,
              business_id
            `)
            .ilike('customer_name', `%${customerData.name}%`)
            .order('created_at', { ascending: false });
          
          if (error) {
            throw error;
          }
          
          reviewsData = data || [];
        } else {
          reviewsData = [];
        }
      }
      
      // Format reviews data - get business names separately to avoid type issues
      const formattedReviews = reviewsData ? await Promise.all(reviewsData.map(async (review) => {
        // Fetch business name separately to avoid complex type references
        let businessName = "Anonymous Business";
        if (review.business_id) {
          try {
            const { data: businessData } = await supabase
              .from('profiles')
              .select('name')
              .eq('id', review.business_id)
              .single();
            businessName = businessData?.name || "Anonymous Business";
          } catch (error) {
            hookLogger.error('Error fetching business name:', error);
          }
        }
        
        return {
          id: review.id,
          rating: review.rating,
          content: review.content,
          date: review.created_at,
          reviewerId: review.business_id,
          reviewerName: businessName
        };
      })) : [];
      
      // Update state with fetched reviews
      setCustomerReviews(prev => ({
        ...prev,
        [customerId]: formattedReviews
      }));
    } catch (error) {
      hookLogger.error("Error fetching reviews:", error);
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
