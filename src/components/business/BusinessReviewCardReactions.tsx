
import React from "react";
import ReviewReactions from "@/components/ReviewReactions";
import { Review } from "@/types";
import { useAuth } from "@/contexts/auth";
import { useReactionPersistence } from "@/hooks/useReactionPersistence";

interface BusinessReviewCardReactionsProps {
  review: Review;
  onReactionToggle: (reviewId: string, reactionType: string) => void;
}

const BusinessReviewCardReactions: React.FC<BusinessReviewCardReactionsProps> = ({
  review,
  onReactionToggle,
}) => {
  const { currentUser } = useAuth();
  
  // Use the same reaction persistence system as customer reviews
  const { reactions, toggleReaction } = useReactionPersistence(
    review.id,
    review.reactions || { like: [], funny: [], ohNo: [] }
  );

  const handleReactionToggle = (reviewId: string, reactionType: string) => {
    toggleReaction(reactionType as keyof typeof reactions);
    onReactionToggle(reviewId, reactionType);
  };
  
  // Don't show reactions if the current user is the author of the review
  if (!currentUser || currentUser.id === review.reviewerId) {
    return null;
  }

  return (
    <div className="border-t pt-4 mb-4">
      <div className="text-sm text-gray-500 mb-2">Your reactions:</div>
      <ReviewReactions 
        reviewId={review.id}
        customerId={review.customerId}
        businessId={review.reviewerId}
        businessName={review.reviewerName}
        businessAvatar={review.reviewerAvatar}
        reactions={reactions}
        onReactionToggle={handleReactionToggle}
      />
    </div>
  );
};

export default BusinessReviewCardReactions;
