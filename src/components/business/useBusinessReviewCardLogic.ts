
import { useNavigate } from "react-router-dom";

export const useBusinessReviewCardLogic = (review: any) => {
  const navigate = useNavigate();

  const handleCustomerClick = () => {
    if (review.customerId) {
      navigate(`/customer/${review.customerId}`);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return "Unknown date";
    }
  };

  const getCustomerInitials = () => {
    if (review.customerName) {
      const names = review.customerName.split(' ');
      return names.map(name => name[0]).join('').toUpperCase().slice(0, 2);
    }
    return "?";
  };

  return {
    handleCustomerClick,
    formatDate,
    getCustomerInitials,
  };
};
