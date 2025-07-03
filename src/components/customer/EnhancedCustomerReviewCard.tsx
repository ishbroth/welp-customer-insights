
import React from "react";
import { Review } from "@/types";
import ReviewMatchInfo from "./ReviewMatchInfo";
import EnhancedReviewContent from "./EnhancedReviewContent";
import ClaimReviewDialog from "./ClaimReviewDialog";
import ReportReviewButton from "./ReportReviewButton";
import { useEnhancedCustomerReviewCard } from "@/hooks/useEnhancedCustomerReviewCard";
import { useReviewPermissions } from "./useReviewPermissions";
import { useCustomerResponseManagement } from "@/hooks/useCustomerResponseManagement";
import { useAuth } from "@/contexts/auth";
import { useCustomerReviewCardHeader } from "./hooks/useCustomerReviewCardHeader";
import CustomerReviewCardHeader from "./CustomerReviewCardHeader";

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
  const { currentUser } = useAuth();
  
  // CRITICAL: Use ONLY the database customerId to determine if review is claimed
  const isReviewActuallyClaimed = !!review.customerId;

  const {
    showClaimDialog,
    setShowClaimDialog,
    reactions,
    businessProfile,
    isReviewAuthor,
    isCustomerBeingReviewed,
    isBusinessUser,
    isCustomerUser,
    finalBusinessAvatar,
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
    try {
      const success = await originalHandleClaimConfirm();
      if (success && onClaimSuccess) {
        onClaimSuccess();
      }
    } catch (error) {
      console.error('Error claiming review:', error);
    }
  };

  // CRITICAL: Use the permission system with the correct claim status
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
    isReviewClaimed: isReviewActuallyClaimed,
    hasSubscription,
    isUnlocked,
  });

  // Force showing claim button for unclaimed reviews when user is customer
  const forceShowClaimButton = isCustomerUser && !isReviewActuallyClaimed && !isReviewAuthor;
  const actualShouldShowClaimButton = forceShowClaimButton || shouldShowClaimButton();

  // Use the customer response management hook
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

  const { businessInfo, customerInfo, handleCustomerClick } = useCustomerReviewCardHeader(
    review,
    businessProfile,
    finalBusinessAvatar,
    isReviewActuallyClaimed,
    currentUser
  );

  const businessDisplayName = businessInfo.name;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border mb-4 relative">
      {/* CRITICAL: Always show match info for unclaimed reviews */}
      {!isReviewActuallyClaimed && (
        <ReviewMatchInfo
          matchType={review.matchType || 'potential'}
          matchReasons={review.matchReasons || ['Potential match found']}
          matchScore={review.matchScore || 0}
          detailedMatches={review.detailedMatches}
          isNewReview={review.isNewReview}
          isClaimingReview={isClaimingReview}
          onClaimClick={handleClaimClick}
          isReviewClaimed={isReviewActuallyClaimed}
        />
      )}
      
      <CustomerReviewCardHeader
        businessInfo={businessInfo}
        customerInfo={customerInfo}
        reviewDate={review.date}
        shouldBusinessNameBeClickable={isUnlocked || hasSubscription}
        onBusinessNameClick={handleBusinessNameClick}
        onCustomerClick={handleCustomerClick}
      />

      <EnhancedReviewContent
        content={review.content}
        shouldShowFullReview={shouldShowFullReview()}
        canReact={canReact()}
        canRespond={canRespond()}
        shouldShowClaimButton={actualShouldShowClaimButton}
        shouldShowRespondButton={shouldShowRespondButton()}
        reviewId={review.id}
        customerId={review.customerId}
        reviewerId={review.reviewerId}
        reviewerName={businessDisplayName}
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

      <div className="flex justify-between items-center mt-4">
        <div></div>
        <ReportReviewButton reviewId={review.id} />
      </div>

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
          name: businessDisplayName,
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
