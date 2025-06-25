
import { Review } from "@/types";
import { useBusinessProfileQuery } from "@/hooks/useBusinessProfileQuery";
import { useCustomerProfileQuery } from "@/hooks/useCustomerProfileQuery";
import { useBusinessVerificationQuery } from "@/hooks/useBusinessVerificationQuery";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UseReviewProfilesProps {
  review: Review & {
    customerAvatar?: string;
    matchType?: 'claimed' | 'high_quality' | 'potential';
    matchReasons?: string[];
    matchScore?: number;
    isNewReview?: boolean;
    customer_phone?: string;
  };
}

export const useReviewProfiles = ({ review }: UseReviewProfilesProps) => {
  // Fetch business profile using dedicated hook
  const { data: businessProfile } = useBusinessProfileQuery(review.reviewerId);

  // Also fetch business_info to get the actual business name
  const { data: businessInfo } = useQuery({
    queryKey: ['businessInfo', review.reviewerId],
    queryFn: async () => {
      console.log('Fetching business_info for reviewerId:', review.reviewerId);
      
      const { data, error } = await supabase
        .from('business_info')
        .select('business_name')
        .eq('id', review.reviewerId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching business_info:', error);
        return null;
      }

      console.log('Business info found:', data);
      return data;
    },
    enabled: !!review.reviewerId
  });

  // Fetch customer profile using dedicated hook
  const { data: customerProfile } = useCustomerProfileQuery(review.customerId);

  // Check business verification status using dedicated hook
  const { data: businessVerificationStatus } = useBusinessVerificationQuery(review.reviewerId);

  // Check if this review has been claimed
  const isReviewClaimed = !!review.customerId;
  console.log(`useReviewProfiles: Review ${review.id} claimed status:`, isReviewClaimed, 'Customer ID:', review.customerId);

  // Business verification status
  const isBusinessVerified = businessVerificationStatus || false;
  
  // Customer verification - assume all customers are verified when they create an account
  const isCustomerVerified = isReviewClaimed && !!customerProfile;
  
  const finalBusinessAvatar = businessProfile?.avatar || review.reviewerAvatar || '';
  
  // Show customer avatar if review is claimed and we have the profile data
  const finalCustomerAvatar = isReviewClaimed && customerProfile?.avatar 
    ? customerProfile.avatar 
    : '';

  // Use business_info name if available, otherwise fall back to profile name
  const enhancedBusinessProfile = businessProfile ? {
    ...businessProfile,
    name: businessInfo?.business_name || businessProfile.name
  } : null;

  console.log('useReviewProfiles: Final status for review', review.id, {
    isReviewClaimed,
    customerProfile: customerProfile ? 'found' : 'not found',
    finalCustomerAvatar,
    isCustomerVerified,
    businessProfile: businessProfile ? 'found' : 'not found',
    businessInfo: businessInfo ? 'found' : 'not found',
    businessDisplayName: businessInfo?.business_name || businessProfile?.name,
    finalBusinessAvatar,
    isBusinessVerified
  });

  return {
    businessProfile: enhancedBusinessProfile,
    customerProfile,
    isBusinessVerified,
    isCustomerVerified,
    finalBusinessAvatar,
    finalCustomerAvatar,
    isReviewClaimed
  };
};
