
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
    console.log("formatDate input:", { _type: typeof dateString, value: dateString });
    console.log("formatDate review.date:", review.date);
    if (!dateString) {
      console.log("formatDate: No date string provided");
      return "Invalid date";
    }
    
    try {
      const date = new Date(dateString);
      console.log("formatDate parsed date:", date);
      
      if (isNaN(date.getTime())) {
        console.log("formatDate: Invalid date object");
        return "Invalid date";
      }
      
      const formatted = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      console.log("formatDate result:", formatted);
      return formatted;
    } catch (error) {
      console.error("formatDate error:", error);
      return "Invalid date";
    }
  };

  const getCustomerInitials = (name?: string) => {
    const customerName = name || review.customerName;
    if (customerName) {
      const names = customerName.split(' ');
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
