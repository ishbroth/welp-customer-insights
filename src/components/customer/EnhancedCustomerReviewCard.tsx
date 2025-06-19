
import React from "react";
import { Review } from "@/types";
import ReviewMatchInfo from "./ReviewMatchInfo";
import EnhancedReviewHeader from "./EnhancedReviewHeader";
import EnhancedReviewContent from "./EnhancedReviewContent";
import ClaimReviewDialog from "./ClaimReviewDialog";
import ReportReviewButton from "./ReportReviewButton";
import { useEnhancedCustomerReviewCard } from "@/hooks/useEnhancedCustomerReviewCard";
import { useReviewPermissions } from "./useReviewPermissions";
import { useCustomerResponseManagement } from "@/hooks/useCustomerResponseManagement";

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
}

const EnhancedCustomerReviewCard: React.FC<EnhancedCustomerReviewCardProps> = ({
  review,
  isUnlocked,
  hasSubscription,
  onPurchase,
  onReactionToggle,
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
    handleClaimConfirm,
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

  // Get phone number to display
  const displayPhone = review.customer_phone || customerProfile?.phone;

  console.log('EnhancedCustomerReviewCard: Rendering review card with data:', {
    reviewId: review.id,
    isReviewClaimed,
    customerProfile: customerProfile ? 'loaded' : 'not loaded',
    businessProfile: businessProfile ? 'loaded' : 'not loaded',
    finalCustomerAvatar,
    finalBusinessAvatar,
    isCustomerVerified,
    isBusinessVerified
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border mb-4 relative">
      {/* Report button in lower right corner */}
      <div className="absolute bottom-4 right-4">
        <ReportReviewButton reviewId={review.id} />
      </div>

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
      
      <EnhancedReviewHeader
        reviewerName={review.reviewerName}
        date={review.date}
        finalBusinessAvatar={finalBusinessAvatar}
        isBusinessVerified={isBusinessVerified}
        isUnlocked={isUnlocked}
        onBusinessNameClick={handleBusinessNameClick}
        customerName={review.customerName}
        finalCustomerAvatar={finalCustomerAvatar}
        displayPhone={displayPhone}
        isReviewClaimed={isReviewClaimed}
        isCustomerVerified={isCustomerVerified}
      />

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
