
import { useNavigate } from "react-router-dom";
import { useCustomerInfo } from "@/hooks/useCustomerInfo";

export const useCustomerReviewCardHeader = (
  review: any,
  businessProfile: any,
  finalBusinessAvatar: string,
  isReviewActuallyClaimed: boolean,
  currentUser: any
) => {
  const navigate = useNavigate();

  // Use enhanced customer info system for display purposes only
  const customerInfo = useCustomerInfo({
    customer_name: review.customerName,
    customer_phone: review.customer_phone,
    customer_address: review.customer_address,
    customer_city: review.customer_city,
    customer_zipcode: review.customer_zipcode,
    customerId: review.customerId,
    matchScore: review.matchScore,
    matchType: review.matchType
  });

  const getInitials = (name: string) => {
    if (name) {
      const names = name.split(' ');
      return names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return "U";
  };

  // Business info for left side (larger)
  const businessDisplayName = businessProfile?.name || review.reviewerName || 'Business';
  const businessInfo = {
    name: businessDisplayName,
    avatar: finalBusinessAvatar,
    initials: getInitials(businessDisplayName),
    verified: businessProfile?.verified || false
  };

  const handleCustomerClick = () => {
    // Only allow navigation for actually claimed reviews
    if (!isReviewActuallyClaimed) return;
    
    navigate(`/customer-profile/${review.customerId}`, {
      state: { 
        readOnly: true,
        showWriteReviewButton: currentUser?.type === 'business'
      }
    });
  };

  // Force display customer info to use actual claim status
  const displayCustomerInfo = {
    ...customerInfo,
    isClaimed: isReviewActuallyClaimed // Force to use database status
  };

  return {
    businessInfo,
    customerInfo: displayCustomerInfo,
    handleCustomerClick
  };
};
