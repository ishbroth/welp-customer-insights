
import { useNavigate } from "react-router-dom";
import { Review } from "@/types";

export const useBusinessReviewCardLogic = (review: Review) => {
  const navigate = useNavigate();

  const handleCustomerClick = () => {
    if (review.customerId) {
      // Navigate to customer profile with read-only view
      navigate(`/customer-profile/${review.customerId}`, {
        state: { 
          readOnly: true,
          showWriteReviewButton: true // Business can write more reviews
        }
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCustomerInitials = () => {
    if (review.customerName) {
      const names = review.customerName.split(' ');
      return names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return "C";
  };

  return {
    handleCustomerClick,
    formatDate,
    getCustomerInitials
  };
};
