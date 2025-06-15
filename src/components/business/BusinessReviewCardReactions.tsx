
import React from "react";
import ReviewReactions from "@/components/ReviewReactions";
import { Review } from "@/types";
import { useAuth } from "@/contexts/auth";

interface BusinessReviewCardReactionsProps {
  review: Review;
  onReactionToggle: (reviewId: string, reactionType: string) => void;
}

const BusinessReviewCardReactions: React.FC<BusinessReviewCardReactionsProps> = ({
  review,
  onReactionToggle,
}) => {
  const { currentUser } = useAuth();
  
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
        reactions={review.reactions || { like: [], funny: [], ohNo: [] }}
        onReactionToggle={onReactionToggle}
      />
    </div>
  );
};

export default BusinessReviewCardReactions;
