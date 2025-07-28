
import { useState } from "react";
import { useReviewClaiming } from "@/hooks/useReviewClaiming";

export const useReviewClaimDialog = () => {
  const { claimReview, isClaimingReview } = useReviewClaiming();

  const handleClaimConfirm = async (reviewId: string) => {
    const success = await claimReview(reviewId);
    if (success) {
      // Return success so parent components can handle state updates
      return true;
    }
    return false;
  };

  return {
    isClaimingReview,
    handleClaimConfirm,
  };
};
