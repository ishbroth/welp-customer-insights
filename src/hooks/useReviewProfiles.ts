
import { Review } from "@/types";
import { useBusinessProfileQuery } from "@/hooks/useBusinessProfileQuery";
import { useCustomerProfileQuery } from "@/hooks/useCustomerProfileQuery";
import { useBusinessVerificationQuery } from "@/hooks/useBusinessVerificationQuery";

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

  // Fetch customer profile using dedicated hook
  const { data: customerProfile } = useCustomerProfileQuery(review.customerId);

  // Check business verification status using dedicated hook
  const { data: businessVerificationStatus } = useBusinessVerificationQuery(review.reviewerId);

  // Check if this review has been claimed
  const isReviewClaimed = !!(review.customerId);
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

  console.log('useReviewProfiles: Final status for review', review.id, {
    isReviewClaimed,
    customerProfile: customerProfile ? 'found' : 'not found',
    finalCustomerAvatar,
    isCustomerVerified,
    businessProfile: businessProfile ? 'found' : 'not found',
    finalBusinessAvatar,
    isBusinessVerified
  });

  return {
    businessProfile,
    customerProfile,
    isBusinessVerified,
    isCustomerVerified,
    finalBusinessAvatar,
    finalCustomerAvatar,
    isReviewClaimed
  };
};
