
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Review } from "@/types";
import StarRating from "@/components/StarRating";
import BusinessReviewCardContent from "./BusinessReviewCardContent";
import BusinessReviewCardPhotos from "./BusinessReviewCardPhotos";
import BusinessReviewCardReactions from "./BusinessReviewCardReactions";
import ReviewConversationSection from "@/components/conversation/ReviewConversationSection";
import BusinessReviewCardHeader from "./BusinessReviewCardHeader";
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
  
  console.log("BusinessReviewCard: Received review data:", {
    id: review.id,
    customerName: review.customerName,
    date: review.date,
    dateType: typeof review.date,
    dateValue: JSON.stringify(review.date)
  });
  
  const { handleCustomerClick, formatDate, getCustomerInitials, isReviewClaimed } = useBusinessReviewCardLogic(review);
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

  // Business info for right side (smaller) 
  const businessInfo = {
    name: review.reviewerName,
    avatar: review.reviewerAvatar,
    initials: getInitials(review.reviewerName),
    verified: review.reviewerVerified
  };

  return (
    <>
      <div className="bg-white px-2 py-4 md:p-6 rounded-lg shadow-sm border relative">
        {/* Customer Header - handles claimed/unclaimed review data automatically */}
        <BusinessReviewCardHeader 
          review={review}
          formatDate={formatDate}
          getCustomerInitials={getCustomerInitials}
          handleCustomerClick={handleCustomerClick}
          isReviewClaimed={isReviewClaimed}
        />


        {/* Add star rating display */}
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <span className="text-base md:text-sm font-medium text-gray-600">Your Rating:</span>
            <StarRating rating={review.rating} />
            <span className="text-base md:text-sm text-gray-500">({review.rating}/5)</span>
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

        {/* Conversation Section */}
        <ReviewConversationSection 
          reviewId={review.id}
          shouldShowFullReview={true}
          isBusinessUser={true}
          className="mt-4"
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
