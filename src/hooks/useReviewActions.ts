
import { useAuth } from "@/contexts/auth";
import { Review } from "@/types";
import { useReviewReactions } from "@/hooks/useReviewReactions";
import { useReviewClaimDialog } from "@/hooks/useReviewClaimDialog";
import { useReviewNavigation } from "@/hooks/useReviewNavigation";

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
  const { currentUser } = useAuth();

  // User type and permission checks
  const isReviewAuthor = currentUser?.id === review.reviewerId;
  const isCustomerBeingReviewed = currentUser?.id === review.customerId;
  const isBusinessUser = currentUser?.type === "business";
  const isCustomerUser = currentUser?.type === "customer";
  
  // FIXED: Check if this review has been claimed - use the actual customerId field from database
  const isReviewClaimed = review.customerId ? true : false;

  console.log('useReviewActions: Review claim status check:', {
    reviewId: review.id,
    customerId: review.customerId,
    matchType: review.matchType,
    isReviewClaimed,
    currentUserId: currentUser?.id
  });

  // Use smaller hooks for specific functionality
  const reactionHook = useReviewReactions({
    reviewId: review.id,
    initialReactions: review.reactions || { like: [], funny: [], ohNo: [] },
    onReactionToggle,
  });

  const claimDialogHook = useReviewClaimDialog();

  const navigationHook = useReviewNavigation({
    reviewerId: review.reviewerId,
    isUnlocked,
  });

  const handlePurchaseClick = () => {
    // For customer users who haven't claimed the review, show claim dialog first
    if (isCustomerUser && isCustomerBeingReviewed && !isReviewClaimed) {
      claimDialogHook.setShowClaimDialog(true);
    } else {
      onPurchase(review.id);
    }
  };

  const handleClaimConfirm = async () => {
    const success = await claimDialogHook.handleClaimConfirm(review.id);
    return success;
  };

  return {
    // User permissions
    isReviewAuthor,
    isCustomerBeingReviewed,
    isBusinessUser,
    isCustomerUser,
    isReviewClaimed,
    
    // Reaction functionality
    reactions: reactionHook.reactions,
    handleReactionToggle: reactionHook.handleReactionToggle,
    
    // Claim dialog functionality
    showClaimDialog: claimDialogHook.showClaimDialog,
    setShowClaimDialog: claimDialogHook.setShowClaimDialog,
    isClaimingReview: claimDialogHook.isClaimingReview,
    handleClaimClick: claimDialogHook.handleClaimClick,
    handleClaimConfirm,
    handleClaimCancel: claimDialogHook.handleClaimCancel,
    
    // Navigation functionality
    handleBusinessNameClick: navigationHook.handleBusinessNameClick,
    
    // Purchase functionality
    handlePurchaseClick,
  };
};
