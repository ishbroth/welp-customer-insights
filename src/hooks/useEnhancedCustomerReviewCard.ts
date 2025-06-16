
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

  // Fetch business profile for avatar and contact info - always fetch since we can identify the business
  const { data: businessProfile } = useQuery({
    queryKey: ['businessProfile', review.reviewerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, avatar, name, phone, address, city, state, zipcode')
        .eq('id', review.reviewerId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching business profile:", error);
        return null;
      }
      return data;
    },
    enabled: !!review.reviewerId
  });

  // Only fetch customer profile if the review has been claimed
  const { data: customerProfile } = useQuery({
    queryKey: ['customerProfile', review.customerId],
    queryFn: async () => {
      if (!review.customerId) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, avatar, first_name, last_name, phone')
        .eq('id', review.customerId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching customer profile:", error);
        return null;
      }
      return data;
    },
    enabled: !!review.customerId && (review.customerId === currentUser?.id)
  });

  const isReviewAuthor = currentUser?.id === review.reviewerId;
  const isCustomerBeingReviewed = currentUser?.id === review.customerId;
  const isBusinessUser = currentUser?.type === "business";
  const isCustomerUser = currentUser?.type === "customer";
  const isVerified = review.reviewerVerified || false;
  const finalBusinessAvatar = review.reviewerAvatar || businessProfile?.avatar || '';
  
  // Only show customer avatar if review is claimed
  const finalCustomerAvatar = review.customerId === currentUser?.id
    ? (review.customerAvatar || customerProfile?.avatar || '') 
    : '';

  // Check if this review has been claimed - use database field, not matchType
  const isReviewClaimed = !!(review.customerId && currentUser && review.customerId === currentUser.id);

  console.log('Review claimed status check:', {
    reviewId: review.id,
    reviewCustomerId: review.customerId,
    currentUserId: currentUser?.id,
    isReviewClaimed,
    matchType: review.matchType
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
    isVerified,
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
