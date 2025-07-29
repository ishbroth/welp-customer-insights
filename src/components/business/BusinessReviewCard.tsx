
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Review } from "@/types";
import StarRating from "@/components/StarRating";
import BusinessReviewCardContent from "./BusinessReviewCardContent";
import BusinessReviewCardPhotos from "./BusinessReviewCardPhotos";
import BusinessReviewCardReactions from "./BusinessReviewCardReactions";
import BusinessReviewCardResponses from "./BusinessReviewCardResponses";
import BusinessReviewCardActions from "./BusinessReviewCardActions";
import ReviewDeleteDialog from "@/components/review/ReviewDeleteDialog";
import { useBusinessReviewCardLogic } from "./useBusinessReviewCardLogic";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import VerifiedBadge from "@/components/ui/VerifiedBadge";

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

  const getInitials = (name: string) => {
    if (name) {
      const names = name.split(' ');
      return names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return "U";
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    console.log("🔥 BusinessReviewCard handleConfirmDelete called with reviewId:", review.id);
    console.log("🔥 onDelete function:", onDelete);
    onDelete(review.id);
    setShowDeleteDialog(false);
  };

  const handleEditClick = () => {
    console.log("=== EDIT REVIEW DEBUG ===");
    console.log("Review object:", review);
    console.log("Review ID:", review.id);
    
    // Prepare review data to pass through navigation state
    const reviewData = {
      rating: review.rating,
      content: review.content,
      customerName: review.customerName,
      phone: (review as any).customer_phone || (review as any).phone || (review as any).customerPhone || '',
      address: (review as any).customer_address || review.address || (review as any).customerAddress || '',
      city: (review as any).customer_city || review.city || (review as any).customerCity || '',
      state: (review as any).customer_state || (review as any).customerState || (review as any).state || '',
      zipCode: (review as any).customer_zipcode || review.zipCode || (review as any).customerZipCode || (review as any).customerZipcode || '',
    };
    
    // Navigate to new review page with customer info pre-filled and edit mode enabled
    const params = new URLSearchParams({
      edit: 'true',
      reviewId: review.id,
    });
    
    console.log("Review data being passed:", reviewData);
    console.log("Navigation params:", Object.fromEntries(params));
    console.log("Full URL:", `/new-review?${params.toString()}`);
    
    navigate(`/review/new?${params.toString()}`, {
      state: { reviewData }
    });
  };

  // Customer info for left side (larger)
  const customerInfo = {
    name: review.customerName,
    avatar: review.customerAvatar,
    initials: getCustomerInitials()
  };

  // Business info for right side (smaller) 
  const businessInfo = {
    name: review.reviewerName,
    avatar: review.reviewerAvatar,
    initials: getInitials(review.reviewerName),
    verified: review.reviewerVerified
  };

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-sm border relative">
        {/* Header with customer on left, business on right */}
        <div className="flex items-start justify-between mb-4">
          {/* Customer info - left side (larger) */}
          <div className="flex items-center space-x-4">
            <Avatar 
              className="h-12 w-12 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleCustomerClick}
            >
              <AvatarImage src={customerInfo.avatar} alt={customerInfo.name} />
              <AvatarFallback className="bg-blue-100 text-blue-800">
                {customerInfo.initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 
                className="font-semibold text-lg cursor-pointer hover:text-blue-600 transition-colors"
                onClick={handleCustomerClick}
              >
                {customerInfo.name}
              </h3>
              <p className="text-sm text-gray-500">
                Review written on {formatDate(review.date)}
              </p>
              <p className="text-sm text-gray-500">Customer</p>
            </div>
          </div>

          {/* Business info - right side (smaller) */}
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={businessInfo.avatar} alt={businessInfo.name} />
              <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                {businessInfo.initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-1">
                <h4 className="font-medium text-sm">{businessInfo.name}</h4>
                {businessInfo.verified && <VerifiedBadge size="sm" />}
              </div>
              <p className="text-xs text-gray-500">Business</p>
            </div>
          </div>
        </div>

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
