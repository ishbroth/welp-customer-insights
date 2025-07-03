
import { useAuth } from "@/contexts/auth";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  // User type and permission checks
  const isReviewAuthor = currentUser?.id === review.reviewerId;
  const isCustomerBeingReviewed = currentUser?.id === review.customerId;
  const isBusinessUser = currentUser?.type === "business";
  const isCustomerUser = currentUser?.type === "customer";
  
  // FIXED: Only check if review has been claimed using database field
  const isReviewClaimed = !!review.customerId;

  console.log('useReviewActions: Review claim status check:', {
    reviewId: review.id,
    customerId: review.customerId,
    matchType: review.matchType,
    isReviewClaimed,
    currentUserId: currentUser?.id,
    isCustomerBeingReviewed,
    isReviewAuthor
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
    if (!currentUser) {
      // Store the review ID and access type for post-login redirect
      sessionStorage.setItem('pendingReviewAccess', JSON.stringify({
        reviewId: review.id,
        accessType: 'one-time'
      }));
      navigate('/login');
      return;
    }

    // FIXED: For customer users who haven't claimed the review, show claim dialog first
    // Check if current user might be the subject of this unclaimed review
    if (isCustomerUser && !isReviewClaimed) {
      console.log('useReviewActions: Customer user trying to purchase unclaimed review, showing claim dialog');
      claimDialogHook.setShowClaimDialog(true);
    } else {
      console.log('useReviewActions: Proceeding with regular purchase');
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
