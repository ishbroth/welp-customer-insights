
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Review } from "@/types";
import StarRating from "@/components/StarRating";
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
  const navigate = useNavigate();

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    onDelete(review.id);
    setShowDeleteDialog(false);
  };

  const handleEditClick = () => {
    console.log("=== EDIT REVIEW DEBUG ===");
    console.log("Review object:", review);
    console.log("Review ID:", review.id);
    
    // Navigate to new review page with customer info pre-filled and edit mode enabled
    const params = new URLSearchParams({
      edit: 'true',
      reviewId: review.id,
      customerFirstName: review.customerName?.split(' ')[0] || '',
      customerLastName: review.customerName?.split(' ').slice(1).join(' ') || '',
      customerPhone: (review as any).customer_phone || (review as any).phone || (review as any).customerPhone || '',
      customerAddress: (review as any).customer_address || review.address || (review as any).customerAddress || '',
      customerCity: (review as any).customer_city || review.city || (review as any).customerCity || '',
      customerState: (review as any).customer_state || (review as any).customerState || (review as any).state || '',
      customerZipCode: (review as any).customer_zipcode || review.zipCode || (review as any).customerZipCode || (review as any).customerZipcode || '',
      rating: review.rating.toString(),
      comment: review.content
    });
    
    console.log("Navigation params:", Object.fromEntries(params));
    console.log("Full URL:", `/new-review?${params.toString()}`);
    
    navigate(`/new-review?${params.toString()}`);
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

        {/* Add star rating display */}
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Your Rating:</span>
            <StarRating rating={review.rating} />
            <span className="text-sm text-gray-500">({review.rating}/5)</span>
          </div>
        </div>

        <BusinessReviewCardContent review={review} />

        <BusinessReviewCardPhotos reviewId={review.id} />

        {/* Move edit/delete actions here, right after the main review content */}
        <BusinessReviewCardActions 
          onEdit={handleEditClick}
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
