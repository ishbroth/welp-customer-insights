
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useCustomerInfo } from "@/hooks/useCustomerInfo";
import { supabase } from "@/integrations/supabase/client";
import { getInitials } from "@/utils/stringUtils";
import { logger } from '@/utils/logger';

export const useCustomerReviewCardHeader = (
  review: any,
  businessProfile: any,
  finalBusinessAvatar: string,
  isReviewActuallyClaimed: boolean,
  currentUser: any
) => {
  const componentLogger = logger.withContext('useCustomerReviewCardHeader');
  const navigate = useNavigate();

  // Fetch actual customer profile if review is claimed
  const { data: customerProfile } = useQuery({
    queryKey: ['customerProfile', review.customerId],
    queryFn: async () => {
      if (!review.customerId) return null;

      componentLogger.debug(`Fetching customer profile for ID: ${review.customerId}`);

      const { data, error } = await supabase
        .from('profiles')
        .select('id, avatar, first_name, last_name, name, phone')
        .eq('id', review.customerId)
        .maybeSingle();

      if (error) {
        componentLogger.error("Error fetching customer profile:", error);
        return null;
      }

      componentLogger.debug(`Customer profile result:`, data);
      return data;
    },
    enabled: !!review.customerId
  });

  // Use enhanced customer info system with actual profile data
  const customerInfo = useCustomerInfo({
    customer_name: review.customerName,
    customer_phone: review.customer_phone,
    customer_address: review.customer_address,
    customer_city: review.customer_city,
    customer_zipcode: review.customer_zipcode,
    customerId: review.customerId,
    matchScore: review.matchScore,
    matchType: review.matchType
  }, customerProfile);

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

  // Force display customer info to use actual claim status and include avatar
  const displayCustomerInfo = {
    ...customerInfo,
    isClaimed: isReviewActuallyClaimed, // Force to use database status
    avatar: customerInfo.avatar || '' // Use profile avatar if available
  };

  return {
    businessInfo,
    customerInfo: displayCustomerInfo,
    handleCustomerClick
  };
};
