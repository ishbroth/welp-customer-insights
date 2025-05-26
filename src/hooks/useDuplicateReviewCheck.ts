
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { Review } from "@/types";

interface ExistingReview {
  id: string;
  rating: number;
  content: string;
  customer_name: string;
  customer_address: string;
  customer_city: string;
  customer_zipcode: string;
  customer_phone: string;
}

export const useDuplicateReviewCheck = () => {
  const { currentUser } = useAuth();
  const [isChecking, setIsChecking] = useState(false);

  const checkForDuplicateReview = async (customerData: {
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    city: string;
    zipCode: string;
  }): Promise<ExistingReview | null> => {
    if (!currentUser) return null;

    setIsChecking(true);
    
    try {
      const customerName = `${customerData.firstName} ${customerData.lastName}`.trim();
      
      // Check for existing review by this business for this customer
      const { data: existingReviews, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          content,
          customer_name,
          customer_address,
          customer_city,
          customer_zipcode,
          customer_phone
        `)
        .eq('business_id', currentUser.id)
        .ilike('customer_name', `%${customerName}%`);

      if (error) {
        console.error("Error checking for duplicate review:", error);
        return null;
      }

      // If we find a review with matching name and other details, consider it a duplicate
      if (existingReviews && existingReviews.length > 0) {
        // For now, we'll return the first match, but we could add more sophisticated matching later
        const match = existingReviews.find(review => {
          const nameMatch = review.customer_name?.toLowerCase().includes(customerName.toLowerCase());
          const phoneMatch = review.customer_phone === customerData.phone;
          const addressMatch = review.customer_address === customerData.address;
          
          // Consider it a match if name matches and at least one other field matches
          return nameMatch && (phoneMatch || addressMatch);
        });

        return match || null;
      }

      return null;
    } catch (error) {
      console.error("Error checking for duplicate review:", error);
      return null;
    } finally {
      setIsChecking(false);
    }
  };

  return {
    checkForDuplicateReview,
    isChecking
  };
};
