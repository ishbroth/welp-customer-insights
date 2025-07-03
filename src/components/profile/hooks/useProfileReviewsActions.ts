
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Review } from "@/types";

export const useProfileReviewsActions = (
  currentUser: any,
  hasSubscription: boolean,
  hasOneTimeAccess: (reviewId: string) => boolean,
  onRefresh?: () => void
) => {
  const { toast } = useToast();
  const navigate = useNavigate();

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

  // Handle successful claim with proper data refresh
  const handleClaimSuccess = () => {
    console.log('Review claimed successfully, refreshing data...');
    if (onRefresh) {
      onRefresh(); // Call the refresh function passed from parent
    }
  };

  return {
    handlePurchaseReview,
    handleReactionToggle,
    handleEditReview,
    handleDeleteReview,
    handleClaimSuccess,
    isReviewUnlocked
  };
};
