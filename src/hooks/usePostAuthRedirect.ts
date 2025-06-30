
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";

export const usePostAuthRedirect = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      // Check if there's pending review data first (higher priority)
      const pendingReviewData = sessionStorage.getItem('pendingReviewData');
      if (pendingReviewData) {
        try {
          const customerData = JSON.parse(pendingReviewData);
          sessionStorage.removeItem('pendingReviewData');
          
          // Only redirect to review form if user is a business
          if (currentUser.type === 'business') {
            // Check if this business has already written a review for this customer
            checkForExistingReview(customerData);
            return;
          }
        } catch (error) {
          console.error("Error parsing pending review data:", error);
        }
      }
      
      // Check if there's pending review access data (secondary priority)
      const pendingData = sessionStorage.getItem('pendingReviewAccess');
      
      if (pendingData) {
        try {
          const { customerData, searchParams } = JSON.parse(pendingData);
          
          // Clear the stored data
          sessionStorage.removeItem('pendingReviewAccess');
          
          // Construct search URL with the original search parameters
          const searchUrl = new URLSearchParams(searchParams);
          navigate(`/search?${searchUrl.toString()}`);
          
        } catch (error) {
          console.error("Error parsing pending review access data:", error);
          // Fallback to profile page
          navigate('/profile');
        }
      }
    }
  }, [currentUser, navigate]);

  const checkForExistingReview = async (customerData: any) => {
    if (!currentUser) return;

    try {
      const customerName = `${customerData.firstName} ${customerData.lastName}`.trim();
      
      // Check for existing review by this business for this customer
      const { data: existingReviews, error } = await supabase
        .from('reviews')
        .select('id, customer_name, customer_phone, customer_address')
        .eq('business_id', currentUser.id);

      if (error) {
        console.error("Error checking for existing review:", error);
        // Fallback to new review form
        const params = new URLSearchParams(customerData);
        navigate(`/review/new?${params.toString()}`);
        return;
      }

      // Check if we have a matching review based on name and other details
      const matchingReview = existingReviews?.find(review => {
        const nameMatch = review.customer_name?.toLowerCase().includes(customerName.toLowerCase());
        const phoneMatch = review.customer_phone === customerData.phone;
        const addressMatch = review.customer_address === customerData.address;
        
        // Consider it a match if name matches and at least one other field matches
        return nameMatch && (phoneMatch || addressMatch);
      });

      if (matchingReview) {
        // Redirect to business reviews page - they already have a review for this customer
        console.log("Existing review found, redirecting to business reviews page");
        navigate('/profile/business-reviews');
      } else {
        // No existing review found, proceed to new review form
        const params = new URLSearchParams(customerData);
        navigate(`/review/new?${params.toString()}`);
      }
    } catch (error) {
      console.error("Error checking for existing review:", error);
      // Fallback to new review form
      const params = new URLSearchParams(customerData);
      navigate(`/review/new?${params.toString()}`);
    }
  };
};
