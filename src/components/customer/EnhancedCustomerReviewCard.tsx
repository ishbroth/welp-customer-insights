import React from "react";
import { useNavigate } from "react-router-dom";
import { Review } from "@/types";
import ReviewMatchInfo from "./ReviewMatchInfo";
import EnhancedReviewContent from "./EnhancedReviewContent";
import ReportReviewButton from "./ReportReviewButton";
import { useEnhancedCustomerReviewCard } from "@/hooks/useEnhancedCustomerReviewCard";
import { useReviewPermissions } from "./useReviewPermissions";
import { useCustomerResponseManagement } from "@/hooks/useCustomerResponseManagement";
import { useAuth } from "@/contexts/auth";
import { useCredits } from "@/hooks/useCredits";
import { useReviewAccess } from "@/hooks/useReviewAccess";
import { useCustomerReviewCardHeader } from "./hooks/useCustomerReviewCardHeader";
import CustomerReviewCardHeader from "./CustomerReviewCardHeader";
import { Star } from "lucide-react";
import { toast } from "@/components/ui/sonner";

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
    matchType?: 'high_quality' | 'potential';
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
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { balance, useCredits: useCreditsFn } = useCredits();
  const { isReviewUnlocked, addUnlockedReview } = useReviewAccess();
  
  // Use persistent review access check instead of local state
  const isReviewActuallyUnlocked = isReviewUnlocked(review.id) || isUnlocked;

  const {
    reactions,
    businessProfile,
    isReviewAuthor,
    isCustomerBeingReviewed,
    isBusinessUser,
    isCustomerUser,
    finalBusinessAvatar,
    handlePurchaseClick,
    handleReactionToggle,
    handleBusinessNameClick,
  } = useEnhancedCustomerReviewCard({
    review,
    isUnlocked: isReviewActuallyUnlocked,
    hasSubscription,
    onPurchase,
    onReactionToggle,
  });

  const handleSubscribeClick = () => {
    navigate('/customer-benefits');
  };

  const handleUseCreditClick = async () => {
    if (balance < 1) {
      toast.error("Insufficient credits");
      return;
    }

    const success = await useCreditsFn(1, `Unlocked review ${review.id}`);
    if (success) {
      addUnlockedReview(review.id);
      toast.success("Review unlocked using 1 credit!");
    }
  };

  // Use the permission system
  const {
    canReact,
    canRespond,
    shouldShowFullReview,
    shouldShowRespondButton,
  } = useReviewPermissions({
    isCustomerUser,
    isBusinessUser,
    isCustomerBeingReviewed,
    isReviewAuthor,
    hasSubscription,
    isUnlocked: isReviewActuallyUnlocked,
  });

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
    false, // No claiming system
    currentUser
  );

  const finalBusinessVerified = review.reviewerVerified || businessProfile?.verified || false;
  const enhancedBusinessInfo = {
    ...businessInfo,
    verified: finalBusinessVerified
  };

  const businessDisplayName = enhancedBusinessInfo.name;

  // Enhanced customer info without claimed status
  const enhancedCustomerInfo = {
    ...customerInfo,
    avatar: review.customerAvatar || ''
  };

  // Render stars - show actual rating if unlocked, grayed out if locked
  const renderStars = (rating: number) => {
    const shouldShowRating = isReviewActuallyUnlocked || hasSubscription;
    
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          shouldShowRating && index < rating
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const canReport = hasSubscription || isReviewActuallyUnlocked;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border mb-4 relative">
      {/* Show match info for all reviews */}
      <ReviewMatchInfo
        matchType={review.matchType || 'potential'}
        matchReasons={review.matchReasons || ['Potential match found']}
        matchScore={review.matchScore || 0}
        detailedMatches={review.detailedMatches}
        isNewReview={review.isNewReview}
        isClaimingReview={false}
        onClaimClick={() => {}}
        isReviewClaimed={false}
      />
      
      <div className="flex justify-between mb-4">
        <CustomerReviewCardHeader
          businessInfo={enhancedBusinessInfo}
          customerInfo={enhancedCustomerInfo}
          reviewDate={review.date}
          shouldBusinessNameBeClickable={isReviewActuallyUnlocked || hasSubscription}
          onBusinessNameClick={handleBusinessNameClick}
          onCustomerClick={handleCustomerClick}
        />
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="flex">{renderStars(review.rating)}</div>
        <span className="text-sm text-gray-500">
          {new Date(review.date).toLocaleDateString()}
        </span>
      </div>

      <EnhancedReviewContent
        content={review.content}
        shouldShowFullReview={shouldShowFullReview()}
        canReact={canReact()}
        canRespond={canRespond()}
        shouldShowClaimButton={false}
        shouldShowRespondButton={shouldShowRespondButton()}
        reviewId={review.id}
        customerId={review.customerId}
        reviewerId={review.reviewerId}
        reviewerName={businessDisplayName}
        finalBusinessAvatar={finalBusinessAvatar}
        reactions={reactions}
        responses={responses}
        hasSubscription={hasSubscription}
        isUnlocked={isReviewActuallyUnlocked}
        creditBalance={balance}
        onPurchaseClick={handlePurchaseClick}
        onClaimClick={() => {}}
        onUnclaimClick={() => {}}
        onReactionToggle={(reactionType: string) => handleReactionToggle(review.id, reactionType)}
        onSubmitResponse={handleSubmitResponse}
        onDeleteResponse={handleDeleteResponse}
        onSubscribeClick={handleSubscribeClick}
        onUseCreditClick={handleUseCreditClick}
        isReviewClaimed={false}
        isClaimingReview={false}
      />

      <div className="flex justify-between items-center mt-4">
        <div></div>
        {canReport && <ReportReviewButton reviewId={review.id} />}
      </div>
    </div>
  );
};

export default EnhancedCustomerReviewCard;
