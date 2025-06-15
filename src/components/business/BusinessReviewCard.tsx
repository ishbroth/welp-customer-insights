
import React, { useState } from "react";
import { Review } from "@/types";
import BusinessReviewCardHeader from "./BusinessReviewCardHeader";
import BusinessReviewCardContent from "./BusinessReviewCardContent";
import BusinessReviewCardPhotos from "./BusinessReviewCardPhotos";
import BusinessReviewCardReactions from "./BusinessReviewCardReactions";
import BusinessReviewCardResponses from "./BusinessReviewCardResponses";
import BusinessReviewCardActions from "./BusinessReviewCardActions";
import ReviewDeleteDialog from "@/components/review/ReviewDeleteDialog";
import { useBusinessReviewCardLogic } from "./useBusinessReviewCardLogic";

interface BusinessReviewCardProps {
  review: Review;
  hasSubscription: boolean;
  onEdit: (review: Review) => void;
  onDelete: (reviewId: string) => void;
  onReactionToggle: (reviewId: string, reactionType: string) => void;
}

const BusinessReviewCard: React.FC<BusinessReviewCardProps> = ({
  review,
  hasSubscription,
  onEdit,
  onDelete,
  onReactionToggle,
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { handleCustomerClick, formatDate, getCustomerInitials } = useBusinessReviewCardLogic(review);

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    onDelete(review.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-sm border relative">
        <BusinessReviewCardHeader
          review={review}
          formatDate={formatDate}
          getCustomerInitials={getCustomerInitials}
          handleCustomerClick={handleCustomerClick}
        />

        <BusinessReviewCardContent review={review} />

        <BusinessReviewCardPhotos reviewId={review.id} />

        {/* Move edit/delete actions here, right after the main review content */}
        <BusinessReviewCardActions 
          review={review}
          onEdit={onEdit}
          handleDeleteClick={handleDeleteClick}
        />

        <BusinessReviewCardReactions 
          review={review}
          onReactionToggle={onReactionToggle}
        />

        <BusinessReviewCardResponses 
          review={review}
          hasSubscription={hasSubscription}
        />
      </div>

      <ReviewDeleteDialog 
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

export default BusinessReviewCard;
