
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useReviewClaiming } from "@/hooks/useReviewClaiming";
import { useReactionPersistence } from "@/hooks/useReactionPersistence";
import { Review } from "@/types";

interface UseReviewActionsProps {
  review: Review & {
    customerAvatar?: string;
    matchType?: 'claimed' | 'high_quality' | 'potential';
    matchReasons?: string[];
    matchScore?: number;
    isNewReview?: boolean;
    customer_phone?: string;
  };
  isUnlocked: boolean;
  onPurchase: (reviewId: string) => void;
  onReactionToggle: (reviewId: string, reactionType: string) => void;
}

export const useReviewActions = ({
  review,
  isUnlocked,
  onPurchase,
  onReactionToggle,
}: UseReviewActionsProps) => {
  const { isSubscribed, currentUser } = useAuth();
  const navigate = useNavigate();
  const { claimReview, isClaimingReview } = useReviewClaiming();
  const [showClaimDialog, setShowClaimDialog] = useState(false);
  const { reactions, toggleReaction } = useReactionPersistence(
    review.id, 
    review.reactions || { like: [], funny: [], ohNo: [] }
  );

  const isReviewAuthor = currentUser?.id === review.reviewerId;
  const isCustomerBeingReviewed = currentUser?.id === review.customerId;
  const isBusinessUser = currentUser?.type === "business";
  const isCustomerUser = currentUser?.type === "customer";
  
  // Check if this review has been claimed
  const isReviewClaimed = !!(review.customerId);

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
    isReviewAuthor,
    isCustomerBeingReviewed,
    isBusinessUser,
    isCustomerUser,
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
