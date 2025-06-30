
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";

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
            const params = new URLSearchParams(customerData);
            navigate(`/review/new?${params.toString()}`);
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
};
