
import { useState } from "react";
import { useReviewClaiming } from "@/hooks/useReviewClaiming";

export const useReviewClaimDialog = () => {
  const { claimReview, isClaimingReview } = useReviewClaiming();
  const [showClaimDialog, setShowClaimDialog] = useState(false);

  const handleClaimClick = () => {
    setShowClaimDialog(true);
  };

  const handleClaimConfirm = async (reviewId: string) => {
    const success = await claimReview(reviewId);
    if (success) {
      // Force a page refresh to show updated data
      window.location.reload();
    }
  };

  const handleClaimCancel = () => {
    // Dialog will close automatically
  };

  return {
    showClaimDialog,
    setShowClaimDialog,
    isClaimingReview,
    handleClaimClick,
    handleClaimConfirm,
    handleClaimCancel,
  };
};
