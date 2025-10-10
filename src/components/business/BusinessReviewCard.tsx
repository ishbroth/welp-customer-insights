
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
import AssociatesDisplay from "@/components/reviews/AssociatesDisplay";
import { formatCustomerNameWithNickname } from "@/utils/nameFormatter";
import { getReviewerDisplayName } from "@/utils/anonymousReviewUtils";
import { useAuth } from "@/contexts/auth";

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
  const { currentUser } = useAuth();
  
  console.log("BusinessReviewCard: Received review data:", {
    id: review.id,
    customerName: review.customerName,
    customer_business_name: review.customer_business_name,
    customer_nickname: review.customer_nickname,
    date: review.date,
    dateType: typeof review.date,
    dateValue: JSON.stringify(review.date),
    associates: review.associates,
    associatesType: typeof review.associates,
    address: review.address,
    city: review.city,
    state: review.state,
    zipCode: review.zipCode
  });

  console.log("🔍 BUSINESS REVIEW CARD - is_anonymous field:", review.is_anonymous);
  console.log("🔍 BUSINESS REVIEW CARD - all review fields:", Object.keys(review));
  console.log("🔍 BUSINESS REVIEW CARD - complete review object:", review);
  console.log("🔍 BUSINESS REVIEW CARD - business_category:", currentUser?.business_category);

  // Business info for right side (smaller) - on "My Customer Reviews" page, always show actual business name
  // since the user is viewing their own reviews
  const isOwnReview = currentUser?.id === review.reviewerId;
  const displayName = getReviewerDisplayName(
    review.is_anonymous || false,
    review.reviewerName,
    currentUser?.business_category,
    isOwnReview
  );

  console.log("🔍 BUSINESS REVIEW CARD - displayName:", displayName, "for review:", review.id);
  
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
    console.log("🔧 EDIT BUTTON CLICKED for review:", review.id);
    console.log("=== EDIT REVIEW DEBUG ===");
    console.log("Review object:", review);
    console.log("Review ID:", review.id);
    
    // Prepare review data to pass through navigation state
    const reviewData = {
      rating: review.rating,
      content: review.content,
      customerName: review.customerName,
      customer_nickname: (review as any).customer_nickname || '',
      customer_business_name: (review as any).customer_business_name || '',
      phone: (review as any).customer_phone || (review as any).phone || (review as any).customerPhone || '',
      address: (review as any).customer_address || review.address || (review as any).customerAddress || '',
      city: (review as any).customer_city || review.city || (review as any).customerCity || '',
      state: (review as any).customer_state || (review as any).customerState || (review as any).state || '',
      zipCode: (review as any).customer_zipcode || review.zipCode || (review as any).customerZipCode || (review as any).customerZipcode || '',
      associates: review.associates || [],
      is_anonymous: review.is_anonymous || false,
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

  const businessInfo = {
    name: displayName,
    avatar: review.reviewerAvatar,
    initials: getInitials(displayName),
    verified: review.reviewerVerified
  };

  return (
    <>
      <div className="bg-white px-3 py-3 md:px-4 md:py-4 rounded-lg shadow-sm border relative">
        {/* Customer Header - handles claimed/unclaimed review data automatically */}
        <BusinessReviewCardHeader 
          review={review}
          formatDate={formatDate}
          getCustomerInitials={getCustomerInitials}
          handleCustomerClick={handleCustomerClick}
          isReviewClaimed={isReviewClaimed}
        />


        {/* Add star rating display */}
        <div className="mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base md:text-sm font-medium text-gray-600">Your Rating:</span>
            <StarRating rating={review.rating} />
            <span className="text-base md:text-sm text-gray-500">({review.rating}/5)</span>
          </div>
        </div>

        <BusinessReviewCardContent review={review} />

        <BusinessReviewCardPhotos reviewId={review.id} />

        {/* Associates and Business Display - split layout */}
        {((review.associates && review.associates.length > 0) || review.customer_business_name) && (
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Associates on the left */}
            {(review.associates && review.associates.length > 0) && (
              <div className="flex-1">
                <AssociatesDisplay
                  associates={review.associates}
                  showBusinessName={false}
                  reviewData={{
                    phone: (review as any).customer_phone || (review as any).phone || (review as any).customerPhone || '',
                    address: review.address || '',
                    city: review.city || '',
                    state: (review as any).customer_state || (review as any).customerState || (review as any).state || '',
                    zipCode: review.zipCode || ''
                  }}
                />
              </div>
            )}

            {/* Business name on the right */}
            {review.customer_business_name && (
              <div className="flex-1">
                <div className="mt-3">
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500 mt-0.5">🏢</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-600 mb-2">Business or Employment:</p>
                      <span className="text-sm text-gray-700 bg-gray-50 px-2 py-1 rounded-md font-medium">
                        🏢 {review.customer_business_name}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

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
