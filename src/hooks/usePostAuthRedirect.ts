
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
      console.log('Checking for existing review by business:', currentUser.id);
      console.log('For customer data:', customerData);
      
      // Check for existing review by this business for this customer
      const { data: existingReviews, error } = await supabase
        .from('reviews')
        .select('id, customer_name, customer_phone, customer_address, customer_city, customer_zipcode')
        .eq('business_id', currentUser.id)
        .is('deleted_at', null); // Only check non-deleted reviews

      if (error) {
        console.error("Error checking for existing review:", error);
        // Fallback to new review form
        const params = new URLSearchParams(customerData);
        navigate(`/review/new?${params.toString()}`);
        return;
      }

      console.log('Found existing reviews:', existingReviews);

      // Normalize customer data for comparison
      const searchName = `${customerData.firstName} ${customerData.lastName}`.trim().toLowerCase();
      const searchPhone = customerData.phone?.replace(/\D/g, ''); // Remove non-digits
      const searchAddress = customerData.address?.toLowerCase().trim();
      const searchCity = customerData.city?.toLowerCase().trim();
      const searchZip = customerData.zipCode?.trim();

      // Check if we have a matching review based on multiple criteria
      const matchingReview = existingReviews?.find(review => {
        const reviewName = review.customer_name?.toLowerCase().trim() || '';
        const reviewPhone = review.customer_phone?.replace(/\D/g, '') || '';
        const reviewAddress = review.customer_address?.toLowerCase().trim() || '';
        const reviewCity = review.customer_city?.toLowerCase().trim() || '';
        const reviewZip = review.customer_zipcode?.trim() || '';
        
        console.log('Comparing:', {
          searchName, reviewName,
          searchPhone, reviewPhone,
          searchAddress, reviewAddress,
          searchCity, reviewCity,
          searchZip, reviewZip
        });
        
        // Check for name match
        const nameMatch = reviewName.includes(searchName) || searchName.includes(reviewName);
        
        // Check for phone match (if both exist)
        const phoneMatch = searchPhone && reviewPhone && searchPhone === reviewPhone;
        
        // Check for address match (if both exist)
        const addressMatch = searchAddress && reviewAddress && 
          (reviewAddress.includes(searchAddress) || searchAddress.includes(reviewAddress));
        
        // Check for city match (if both exist)
        const cityMatch = searchCity && reviewCity && reviewCity === searchCity;
        
        // Check for zip match (if both exist)
        const zipMatch = searchZip && reviewZip && reviewZip === searchZip;
        
        // Consider it a match if:
        // - Name matches AND (phone matches OR address+city matches OR zip matches)
        const isMatch = nameMatch && (phoneMatch || (addressMatch && cityMatch) || zipMatch);
        
        console.log('Match criteria:', {
          nameMatch, phoneMatch, addressMatch, cityMatch, zipMatch, isMatch
        });
        
        return isMatch;
      });

      if (matchingReview) {
        // Redirect to edit the existing review
        console.log("Existing review found, redirecting to edit:", matchingReview.id);
        const reviewDataForEdit = {
          id: matchingReview.id,
          rating: 0, // Will be loaded from database
          content: '', // Will be loaded from database
          customerName: matchingReview.customer_name,
          address: matchingReview.customer_address || "",
          city: matchingReview.customer_city || "",
          zipCode: matchingReview.customer_zipcode || "",
          phone: matchingReview.customer_phone || ""
        };
        
        navigate(`/review/new?edit=true&reviewId=${matchingReview.id}`, {
          state: {
            reviewData: reviewDataForEdit,
            isEditing: true
          }
        });
      } else {
        // No existing review found, proceed to new review form
        console.log("No existing review found, proceeding to new review form");
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
