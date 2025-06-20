
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Review } from "@/types";

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
  // Always fetch business profile since we need to display business info
  const { data: businessProfile } = useQuery({
    queryKey: ['businessProfile', review.reviewerId],
    queryFn: async () => {
      console.log(`useReviewProfiles: Fetching business profile for ID: ${review.reviewerId}`);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, avatar, name, phone, address, city, state, zipcode, verified')
        .eq('id', review.reviewerId)
        .maybeSingle();

      if (error) {
        console.error("useReviewProfiles: Error fetching business profile:", error);
        return null;
      }
      
      console.log(`useReviewProfiles: Business profile result:`, data);
      return data;
    },
    enabled: !!review.reviewerId
  });

  // Fetch customer profile if the review has been claimed - ALWAYS try to fetch
  const { data: customerProfile } = useQuery({
    queryKey: ['customerProfile', review.customerId],
    queryFn: async () => {
      if (!review.customerId) {
        console.log(`useReviewProfiles: No customer ID for review ${review.id}`);
        return null;
      }
      
      console.log(`useReviewProfiles: Fetching customer profile for ID: ${review.customerId}`);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, avatar, first_name, last_name, name, phone, verified')
        .eq('id', review.customerId)
        .maybeSingle();

      if (error) {
        console.error("useReviewProfiles: Error fetching customer profile:", error);
        return null;
      }

      console.log(`useReviewProfiles: Customer profile result:`, data);
      return data;
    },
    enabled: !!review.customerId,
    retry: 2
  });

  // Check business verification status
  const { data: businessVerificationStatus } = useQuery({
    queryKey: ['businessVerified', review.reviewerId],
    queryFn: async () => {
      if (!review.reviewerId) return false;
      
      console.log(`useReviewProfiles: Checking business verification for: ${review.reviewerId}`);
      
      const { data, error } = await supabase
        .from('business_info')
        .select('verified')
        .eq('id', review.reviewerId)
        .maybeSingle();
      
      if (error) {
        console.error("useReviewProfiles: Error fetching business verification:", error);
        return false;
      }
      
      console.log(`useReviewProfiles: Business verification result:`, data?.verified);
      return data?.verified || false;
    },
    enabled: !!review.reviewerId
  });

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
