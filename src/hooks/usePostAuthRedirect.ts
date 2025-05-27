
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";

export const usePostAuthRedirect = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      // Check if there's pending review access data
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
