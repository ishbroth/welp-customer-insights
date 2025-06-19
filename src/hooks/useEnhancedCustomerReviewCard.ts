import { useState } from "react";
import { useAuth } from "@/contexts/auth";
import { useNavigate } from "react-router-dom";
import { useReviewClaiming } from "@/hooks/useReviewClaiming";
import { useReactionPersistence } from "@/hooks/useReactionPersistence";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Review } from "@/types";

interface UseEnhancedCustomerReviewCardProps {
  review: Review & {
    customerAvatar?: string;
    matchType?: 'claimed' | 'high_quality' | 'potential';
    matchReasons?: string[];
    matchScore?: number;
    isNewReview?: boolean;
    customer_phone?: string;
  };
  isUnlocked: boolean;
  hasSubscription: boolean;
  onPurchase: (reviewId: string) => void;
  onReactionToggle: (reviewId: string, reactionType: string) => void;
}

export const useEnhancedCustomerReviewCard = ({
  review,
  isUnlocked,
  hasSubscription,
  onPurchase,
  onReactionToggle,
}: UseEnhancedCustomerReviewCardProps) => {
  const { isSubscribed, currentUser } = useAuth();
  const navigate = useNavigate();
  const { claimReview, isClaimingReview } = useReviewClaiming();
  const [showClaimDialog, setShowClaimDialog] = useState(false);
  const { reactions, toggleReaction } = useReactionPersistence(
    review.id, 
    review.reactions || { like: [], funny: [], ohNo: [] }
  );

  // Always fetch business profile since we need to display business info
  const { data: businessProfile } = useQuery({
    queryKey: ['businessProfile', review.reviewerId],
    queryFn: async () => {
      console.log(`useEnhancedCustomerReviewCard: Fetching business profile for ID: ${review.reviewerId}`);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, avatar, name, phone, address, city, state, zipcode, verified')
        .eq('id', review.reviewerId)
        .maybeSingle();

      if (error) {
        console.error("useEnhancedCustomerReviewCard: Error fetching business profile:", error);
        return null;
      }
      
      console.log(`useEnhancedCustomerReviewCard: Business profile result:`, data);
      return data;
    },
    enabled: !!review.reviewerId
  });

  // Check if this review has been claimed
  const isReviewClaimed = !!(review.customerId);
  console.log(`useEnhancedCustomerReviewCard: Review ${review.id} claimed status:`, isReviewClaimed, 'Customer ID:', review.customerId);

  // Fetch customer profile if the review has been claimed - ALWAYS try to fetch
  const { data: customerProfile } = useQuery({
    queryKey: ['customerProfile', review.customerId],
    queryFn: async () => {
      if (!review.customerId) {
        console.log(`useEnhancedCustomerReviewCard: No customer ID for review ${review.id}`);
        return null;
      }
      
      console.log(`useEnhancedCustomerReviewCard: Fetching customer profile for ID: ${review.customerId}`);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, avatar, first_name, last_name, name, phone, verified')
        .eq('id', review.customerId)
        .maybeSingle();

      if (error) {
        console.error("useEnhancedCustomerReviewCard: Error fetching customer profile:", error);
        return null;
      }

      console.log(`useEnhancedCustomerReviewCard: Customer profile result:`, data);
      return data;
    },
    enabled: !!review.customerId, // Only fetch if we have a customer ID
    retry: 2 // Retry failed requests
  });

  // Check business verification status
  const { data: businessVerificationStatus } = useQuery({
    queryKey: ['businessVerified', review.reviewerId],
    queryFn: async () => {
      if (!review.reviewerId) return false;
      
      console.log(`useEnhancedCustomerReviewCard: Checking business verification for: ${review.reviewerId}`);
      
      const { data, error } = await supabase
        .from('business_info')
        .select('verified')
        .eq('id', review.reviewerId)
        .maybeSingle();
      
      if (error) {
        console.error("useEnhancedCustomerReviewCard: Error fetching business verification:", error);
        return false;
      }
      
      console.log(`useEnhancedCustomerReviewCard: Business verification result:`, data?.verified);
      return data?.verified || false;
    },
    enabled: !!review.reviewerId
  });

  const isReviewAuthor = currentUser?.id === review.reviewerId;
  const isCustomerBeingReviewed = currentUser?.id === review.customerId;
  const isBusinessUser = currentUser?.type === "business";
  const isCustomerUser = currentUser?.type === "customer";
  
  // Business verification status
  const isBusinessVerified = businessVerificationStatus || false;
  
  // Customer verification - assume all customers are verified when they create an account
  const isCustomerVerified = isReviewClaimed && !!customerProfile;
  
  const finalBusinessAvatar = businessProfile?.avatar || review.reviewerAvatar || '';
  
  // Show customer avatar if review is claimed and we have the profile data
  const finalCustomerAvatar = isReviewClaimed && customerProfile?.avatar 
    ? customerProfile.avatar 
    : '';

  console.log('useEnhancedCustomerReviewCard: Final status for review', review.id, {
    isReviewClaimed,
    customerProfile: customerProfile ? 'found' : 'not found',
    finalCustomerAvatar,
    isCustomerVerified,
    businessProfile: businessProfile ? 'found' : 'not found',
    finalBusinessAvatar,
    isBusinessVerified
  });

  const handlePurchaseClick = () => {
    // For customer users who haven't claimed the review, show claim dialog first
    if (isCustomerUser && isCustomerBeingReviewed && !isReviewClaimed) {
      setShowClaimDialog(true);
    } else {
      onPurchase(review.id);
    }
  };

  const handleClaimClick = () => {
    setShowClaimDialog(true);
  };

  const handleClaimConfirm = async () => {
    const success = await claimReview(review.id);
    if (success) {
      // Force a page refresh to show updated data
      window.location.reload();
    }
  };

  const handleClaimCancel = () => {
    // Dialog will close automatically
  };

  const handleReactionToggle = (reviewId: string, reactionType: string) => {
    toggleReaction(reactionType as keyof typeof reactions);
    onReactionToggle(reviewId, reactionType);
  };

  const handleBusinessNameClick = () => {
    if (isSubscribed || isUnlocked) {
      navigate(`/business/${review.reviewerId}`);
    }
  };

  return {
    showClaimDialog,
    setShowClaimDialog,
    reactions,
    businessProfile,
    customerProfile,
    isReviewAuthor,
    isCustomerBeingReviewed,
    isBusinessUser,
    isCustomerUser,
    isBusinessVerified,
    isCustomerVerified,
    finalBusinessAvatar,
    finalCustomerAvatar,
    isReviewClaimed,
    isClaimingReview,
    handlePurchaseClick,
    handleClaimClick,
    handleClaimConfirm,
    handleClaimCancel,
    handleReactionToggle,
    handleBusinessNameClick,
  };
};
