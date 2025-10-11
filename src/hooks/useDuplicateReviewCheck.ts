
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { Review } from "@/types";
import { compareAddresses } from "@/utils/addressNormalization";
import { logger } from "@/utils/logger";

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

// Helper function to normalize phone numbers for comparison
const normalizePhone = (phone: string | null | undefined): string => {
  if (!phone) return '';
  return phone.replace(/\D/g, ''); // Remove all non-digits
};

// Helper function to check if phones match (handling empty/null values)
const phonesMatch = (phone1: string | null | undefined, phone2: string | null | undefined): boolean => {
  const normalized1 = normalizePhone(phone1);
  const normalized2 = normalizePhone(phone2);
  
  // If both are empty, don't consider it a match
  if (!normalized1 && !normalized2) return false;
  
  // If one is empty but the other has data, consider it a potential match
  if (!normalized1 || !normalized2) return true;
  
  // Both have data, check if they match
  return normalized1 === normalized2;
};

export const useDuplicateReviewCheck = () => {
  const hookLogger = logger.withContext('DuplicateReviewCheck');
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
        hookLogger.error("Error checking for duplicate review:", error);
        return null;
      }

      // If we find a review with matching name and other details, consider it a duplicate
      if (existingReviews && existingReviews.length > 0) {
        hookLogger.debug("=== DUPLICATE REVIEW CHECK DEBUG ===");
        hookLogger.debug("Customer data:", customerData);
        hookLogger.debug("Existing reviews found:", existingReviews.length);

        const match = existingReviews.find(review => {
          hookLogger.debug("Checking review:", {
            id: review.id,
            customer_name: review.customer_name,
            customer_phone: review.customer_phone,
            customer_address: review.customer_address
          });

          const nameMatch = review.customer_name?.toLowerCase().includes(customerName.toLowerCase());
          hookLogger.debug("Name match:", nameMatch);

          // Use enhanced phone matching
          const phoneMatch = phonesMatch(review.customer_phone, customerData.phone);
          hookLogger.debug("Phone match:", phoneMatch, {
            existing: review.customer_phone,
            new: customerData.phone
          });

          // Use fuzzy address matching with 80% similarity threshold
          const addressMatch = compareAddresses(
            review.customer_address || '',
            customerData.address,
            0.8
          );
          hookLogger.debug("Address match:", addressMatch, {
            existing: review.customer_address,
            new: customerData.address
          });

          const isMatch = nameMatch && (phoneMatch || addressMatch);
          hookLogger.debug("Overall match result:", isMatch);

          return isMatch;
        });

        hookLogger.debug("Final match result:", match ? "DUPLICATE FOUND" : "NO DUPLICATE");
        hookLogger.debug("=== DUPLICATE REVIEW CHECK DEBUG END ===");
        
        return match || null;
      }

      return null;
    } catch (error) {
      hookLogger.error("Error checking for duplicate review:", error);
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
