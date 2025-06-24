
import React from "react";
import { Review } from "@/types";
import ReviewMatchInfo from "./ReviewMatchInfo";
import EnhancedReviewContent from "./EnhancedReviewContent";
import ClaimReviewDialog from "./ClaimReviewDialog";
import ReportReviewButton from "./ReportReviewButton";
import { useEnhancedCustomerReviewCard } from "@/hooks/useEnhancedCustomerReviewCard";
import { useReviewPermissions } from "./useReviewPermissions";
import { useCustomerResponseManagement } from "@/hooks/useCustomerResponseManagement";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import VerifiedBadge from "@/components/ui/VerifiedBadge";

interface DetailedMatch {
  field: string;
  reviewValue: string;
  searchValue: string;
  similarity: number;
  matchType: 'exact' | 'partial' | 'fuzzy';
}

interface EnhancedCustomerReviewCardProps {
  review: Review & {
    customerAvatar?: string;
    matchType?: 'claimed' | 'high_quality' | 'potential';
    matchReasons?: string[];
    matchScore?: number;
    detailedMatches?: DetailedMatch[];
    isNewReview?: boolean;
    customer_phone?: string;
  };
  isUnlocked: boolean;
  hasSubscription: boolean;
  onPurchase: (reviewId: string) => void;
  onReactionToggle: (reviewId: string, reactionType: string) => void;
  onClaimSuccess?: () => void;
}

const EnhancedCustomerReviewCard: React.FC<EnhancedCustomerReviewCardProps> = ({
  review,
  isUnlocked,
  hasSubscription,
  onPurchase,
  onReactionToggle,
  onClaimSuccess,
}) => {
  const {
    showClaimDialog,
    setShowClaimDialog,
    reactions,
    businessProfile,
    customerProfile,
    isReviewAuthor,
    isCustomerBeingReviewed,
    isBusinessUser,
    isCustomerUser,
    isBusinessVerified,
    isCustomerVerified,
    finalBusinessAvatar,
    finalCustomerAvatar,
    isReviewClaimed,
    isClaimingReview,
    handlePurchaseClick,
    handleClaimClick,
    handleClaimConfirm: originalHandleClaimConfirm,
    handleClaimCancel,
    handleReactionToggle,
    handleBusinessNameClick,
  } = useEnhancedCustomerReviewCard({
    review,
    isUnlocked,
    hasSubscription,
    onPurchase,
    onReactionToggle,
  });

  // Enhanced claim confirm handler that calls the success callback
  const handleClaimConfirm = async () => {
    const success = await originalHandleClaimConfirm();
    if (success && onClaimSuccess) {
      onClaimSuccess();
    }
  };

  const {
    canReact,
    canRespond,
    shouldShowFullReview,
    shouldShowClaimButton,
    shouldShowRespondButton,
  } = useReviewPermissions({
    isCustomerUser,
    isBusinessUser,
    isCustomerBeingReviewed,
    isReviewAuthor,
    isReviewClaimed,
    hasSubscription,
    isUnlocked,
  });

  // Use the customer response management hook to handle responses properly
  const {
    responses,
    handleSubmitResponse,
    handleDeleteResponse,
    canCustomerRespond
  } = useCustomerResponseManagement(
    review.id,
    review.responses || [],
    review.reviewerId,
    (newResponse) => {
      console.log('New response submitted:', newResponse);
    }
  );

  const getInitials = (name: string) => {
    if (name) {
      const names = name.split(' ');
      return names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return "U";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get phone number to display
  const displayPhone = review.customer_phone || customerProfile?.phone;

  // Business info for left side (larger)
  const businessInfo = {
    name: review.reviewerName,
    avatar: finalBusinessAvatar,
    initials: getInitials(review.reviewerName),
    verified: isBusinessVerified
  };

  // Customer info for right side (smaller)
  const customerInfo = {
    name: review.customerName,
    avatar: finalCustomerAvatar,
    initials: getInitials(review.customerName),
    verified: isCustomerVerified,
    phone: displayPhone
  };

  console.log('EnhancedCustomerReviewCard: Rendering review card with data:', {
    reviewId: review.id,
    isReviewClaimed,
    matchType: review.matchType,
    customerProfile: customerProfile ? 'loaded' : 'not loaded',
    businessProfile: businessProfile ? 'loaded' : 'not loaded',
    finalCustomerAvatar,
    finalBusinessAvatar,
    isCustomerVerified,
    isBusinessVerified,
    shouldShowClaimButton: shouldShowClaimButton()
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border mb-4 relative">
      {/* Report button in lower right corner */}
      <div className="absolute bottom-4 right-4">
        <ReportReviewButton reviewId={review.id} />
      </div>

      {/* Show match info and claim button for unclaimed reviews */}
      {!isReviewClaimed && (
        <ReviewMatchInfo
          matchType={review.matchType}
          matchReasons={review.matchReasons}
          matchScore={review.matchScore}
          detailedMatches={review.detailedMatches}
          isNewReview={review.isNewReview}
          isClaimingReview={isClaimingReview}
          onClaimClick={handleClaimClick}
          isReviewClaimed={isReviewClaimed}
        />
      )}
      
      {/* Header with business on left, customer on right */}
      <div className="flex items-start justify-between mb-4">
        {/* Business info - left side (larger) */}
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={businessInfo.avatar} alt={businessInfo.name} />
            <AvatarFallback className="bg-blue-100 text-blue-800">
              {businessInfo.initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 
                className={`font-semibold text-lg ${
                  isUnlocked ? 'cursor-pointer hover:text-blue-600 transition-colors' : ''
                }`}
                onClick={isUnlocked ? handleBusinessNameClick : undefined}
              >
                {businessInfo.name}
              </h3>
              {businessInfo.verified && <VerifiedBadge size="sm" />}
            </div>
            <p className="text-sm text-gray-500">
              Review written on {formatDate(review.date)}
            </p>
            <p className="text-sm text-gray-500">Business</p>
          </div>
        </div>

        {/* Customer info - right side (smaller) */}
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={customerInfo.avatar} alt={customerInfo.name} />
            <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
              {customerInfo.initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-1">
              <h4 className="font-medium text-sm">{customerInfo.name}</h4>
              {customerInfo.verified && <VerifiedBadge size="xs" />}
              {isReviewClaimed && (
                <span className="text-xs text-green-600 font-medium">Claimed</span>
              )}
            </div>
            <p className="text-xs text-gray-500">Customer</p>
            {customerInfo.phone && (
              <p className="text-xs text-gray-600">
                {customerInfo.phone}
              </p>
            )}
          </div>
        </div>
      </div>

      <EnhancedReviewContent
        content={review.content}
        shouldShowFullReview={shouldShowFullReview()}
        canReact={canReact()}
        canRespond={canRespond()}
        shouldShowClaimButton={shouldShowClaimButton()}
        shouldShowRespondButton={shouldShowRespondButton()}
        reviewId={review.id}
        customerId={review.customerId}
        reviewerId={review.reviewerId}
        reviewerName={review.reviewerName}
        finalBusinessAvatar={finalBusinessAvatar}
        reactions={reactions}
        responses={responses}
        hasSubscription={hasSubscription}
        isUnlocked={isUnlocked}
        onPurchaseClick={handlePurchaseClick}
        onClaimClick={handleClaimClick}
        onReactionToggle={handleReactionToggle}
        onSubmitResponse={handleSubmitResponse}
        onDeleteResponse={handleDeleteResponse}
      />

      <ClaimReviewDialog 
        open={showClaimDialog}
        onOpenChange={setShowClaimDialog}
        reviewData={{
          customerName: review.customerName,
          customerPhone: review.customer_phone,
          customerAddress: review.customer_address,
          customerCity: review.customer_city,
          customerZipcode: review.customer_zipcode,
        }}
        businessData={{
          name: review.reviewerName,
          avatar: finalBusinessAvatar,
          phone: businessProfile?.phone,
          address: businessProfile?.address,
          city: businessProfile?.city,
          state: businessProfile?.state,
          zipcode: businessProfile?.zipcode,
        }}
        businessId={review.reviewerId}
        onConfirm={handleClaimConfirm}
        onCancel={handleClaimCancel}
      />
    </div>
  );
};

export default EnhancedCustomerReviewCard;
