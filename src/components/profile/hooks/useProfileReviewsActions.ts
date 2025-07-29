
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Review } from "@/types";
import { useReviewAssociation } from "@/hooks/useReviewAssociation";

export const useProfileReviewsActions = (
  currentUser: any,
  hasSubscription: boolean,
  hasOneTimeAccess: (reviewId: string) => boolean,
  onRefresh?: () => void
) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { createAssociation } = useReviewAssociation();

  const handlePurchaseReview = (reviewId: string) => {
    toast({
      title: "Purchase initiated",
      description: "Processing payment for review access...",
      duration: 2000,
    });
    
    navigate(`/one-time-review?customerId=${currentUser?.id}&reviewId=${reviewId}`);
  };

  const isReviewUnlocked = (reviewId: string): boolean => {
    return hasOneTimeAccess(reviewId) || hasSubscription;
  };

  const handleReactionToggle = (reviewId: string, reactionType: string) => {
    toast({
      title: `You reacted with "${reactionType}"`,
      description: `to the review`,
    });
  };

  const handleEditReview = (review: Review) => {
    navigate(`/edit-review/${review.id}`);
  };

  const handleDeleteReview = (reviewId: string) => {
    console.log('Delete review:', reviewId);
  };

  // Handle successful claim with proper data refresh and create association
  const handleClaimSuccess = async (reviewId: string) => {
    console.log('🎯 Review claimed successfully in useProfileReviewsActions');
    
    // Create the permanent association
    if (currentUser?.id) {
      await createAssociation(currentUser.id, reviewId, 'responded');
    }
    
    // Show success toast
    toast({
      title: "Review claimed successfully",
      description: "This review has been added to your profile.",
    });
    
    // Trigger data refresh
    if (onRefresh) {
      console.log('🎯 Calling onRefresh to trigger data refresh...');
      onRefresh();
    } else {
      console.log('🎯 No onRefresh function provided');
    }
  };

  // Handle successful purchase and create association
  const handlePurchaseSuccess = async (reviewId: string) => {
    if (currentUser?.id) {
      await createAssociation(currentUser.id, reviewId, 'purchased');
      
      // Trigger data refresh
      if (onRefresh) {
        onRefresh();
      }
    }
  };

  return {
    handlePurchaseReview,
    handleReactionToggle,
    handleEditReview,
    handleDeleteReview,
    handleClaimSuccess,
    handlePurchaseSuccess,
    isReviewUnlocked
  };
};
