
import { useState } from "react";
import { useReviewClaiming } from "@/hooks/useReviewClaiming";

export const useReviewClaimDialog = () => {
  const { claimReview, isClaimingReview } = useReviewClaiming();
  const [showClaimDialog, setShowClaimDialog] = useState(false);

  const handleClaimConfirm = async (reviewId: string) => {
    const success = await claimReview(reviewId);
    if (success) {
      setShowClaimDialog(false);
      return true;
    }
    return false;
  };

  const handleClaimClick = () => {
    setShowClaimDialog(true);
  };

  const handleClaimCancel = () => {
    setShowClaimDialog(false);
  };

  return {
    showClaimDialog,
    setShowClaimDialog,
    isClaimingReview,
    handleClaimConfirm,
    handleClaimClick,
    handleClaimCancel,
  };
};
