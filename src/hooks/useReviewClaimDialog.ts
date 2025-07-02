
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
      setShowClaimDialog(false);
      // Return success so parent components can handle state updates
      return true;
    }
    return false;
  };

  const handleClaimCancel = () => {
    setShowClaimDialog(false);
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
