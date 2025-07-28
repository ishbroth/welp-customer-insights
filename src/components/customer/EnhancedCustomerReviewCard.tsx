
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Review } from "@/types";
import ReviewMatchInfo from "./ReviewMatchInfo";
import EnhancedReviewContent from "./EnhancedReviewContent";
import ReportReviewButton from "./ReportReviewButton";
import { useEnhancedCustomerReviewCard } from "@/hooks/useEnhancedCustomerReviewCard";
import { useReviewPermissions } from "./useReviewPermissions";
import { useCustomerResponseManagement } from "@/hooks/useCustomerResponseManagement";
import { useReviewClaiming } from "@/hooks/useReviewClaiming";
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
    matchType?: 'claimed' | 'high_quality' | 'potential';
    matchReasons?: string[];
    matchScore?: number;
    detailedMatches?: DetailedMatch[];
    isNewReview?: boolean;
    customer_phone?: string;
    isExplicitlyClaimed?: boolean;
    isClaimed?: boolean;
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
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { balance, useCredits: useCreditsFn } = useCredits();
  const { claimReview, unclaimReview, isClaimingReview } = useReviewClaiming();
  const { isReviewUnlocked, addUnlockedReview } = useReviewAccess();
  const [localIsClaimedState, setLocalIsClaimedState] = useState(review.isClaimed || false);
  
  // Use persistent review access check instead of local state
  const isReviewActuallyUnlocked = isReviewUnlocked(review.id) || isUnlocked;
  const isReviewActuallyClaimed = localIsClaimedState || review.isClaimed === true || !!review.customerId;

  console.log('🎯 EnhancedCustomerReviewCard: CRITICAL DEBUG', {
    reviewId: review.id,
    customerId: review.customerId,
    originalIsClaimed: review.isClaimed,
    localIsClaimedState,
    isReviewActuallyClaimed,
    isReviewActuallyUnlocked,
    isUnlockedViaPersistence: isReviewUnlocked(review.id),
    creditBalance: balance,
    hasSubscription,
    matchType: review.matchType,
    matchScore: review.matchScore,
    currentUserId: currentUser?.id,
  });

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

  // Handle subscribe button click to go to customer benefits page
  const handleSubscribeClick = () => {
    navigate('/customer-benefits');
  };

  // Handle credit usage with persistent access
  const handleUseCreditClick = async () => {
    if (balance < 1) {
      toast.error("Insufficient credits");
      return;
    }

    const success = await useCreditsFn(1, `Unlocked review ${review.id}`);
    if (success) {
      // Add to persistent access immediately
      addUnlockedReview(review.id);
      toast.success("Review unlocked using 1 credit!");
    }
  };

  console.log('🎯 Business Profile Debug:', {
    businessProfile: businessProfile ? 'found' : 'not found',
    businessName: businessProfile?.name,
    businessVerified: businessProfile?.verified,
    reviewerVerified: review.reviewerVerified,
    finalBusinessAvatar: finalBusinessAvatar ? 'present' : 'missing',
    CRITICAL_VERIFICATION_CHECK: {
      fromBusinessProfile: businessProfile?.verified,
      fromReviewData: review.reviewerVerified,
      finalVerificationStatus: review.reviewerVerified || businessProfile?.verified
    }
  });

  // Use the permission system with the ACTUAL claim status
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
    isReviewActuallyClaimed,
    currentUser
  );

  const finalBusinessVerified = review.reviewerVerified || businessProfile?.verified || false;
  const enhancedBusinessInfo = {
    ...businessInfo,
    verified: finalBusinessVerified
  };

  const businessDisplayName = enhancedBusinessInfo.name;

  // Handle direct claim without dialog
  const handleDirectClaimClick = async () => {
    console.log('🎯 Starting direct claim process for review:', review.id);
    const success = await claimReview(review.id);
    
    if (success) {
      console.log('🎯 Claim successful! Updating UI state immediately...');
      
      // Update local state immediately for instant UI feedback
      setLocalIsClaimedState(true);
      
      // Call the parent refresh function after a short delay to ensure database is updated
      if (onClaimSuccess) {
        console.log('🎯 Calling onClaimSuccess to refresh parent data...');
        setTimeout(() => {
          onClaimSuccess();
        }, 100);
      }
    } else {
      console.log('🎯 Claim failed, not updating UI state');
    }
  };

  // Handle direct unclaim
  const handleDirectUnclaimClick = async () => {
    console.log('🎯 Starting direct unclaim process for review:', review.id);
    const success = await unclaimReview(review.id);
    
    if (success) {
      console.log('🎯 Unclaim successful! Updating UI state immediately...');
      
      // Update local state immediately for instant UI feedback
      setLocalIsClaimedState(false);
      
      // Call the parent refresh function after a short delay to ensure database is updated
      if (onClaimSuccess) {
        console.log('🎯 Calling onClaimSuccess to refresh parent data...');
        setTimeout(() => {
          onClaimSuccess();
        }, 100);
      }
    } else {
      console.log('🎯 Unclaim failed, not updating UI state');
    }
  };

  // Enhanced customer info to show claimed status and include avatar
  const enhancedCustomerInfo = {
    ...customerInfo,
    isClaimed: isReviewActuallyClaimed,
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

  console.log('🎯 Final Render Decisions:', {
    reviewId: review.id,
    isReviewActuallyClaimed,
    isReviewActuallyUnlocked,
    shouldShowClaimButton: shouldShowClaimButton(),
    shouldShowRespondButton: shouldShowRespondButton(),
    shouldShowFullReview: shouldShowFullReview(),
    businessVerified: finalBusinessVerified,
    businessName: businessDisplayName,
    matchType: review.matchType,
    canReport,
    creditBalance: balance
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border mb-4 relative">
      {/* Show match info ONLY for unclaimed reviews */}
      {!isReviewActuallyClaimed && (
        <ReviewMatchInfo
          matchType={review.matchType || 'potential'}
          matchReasons={review.matchReasons || ['Potential match found']}
          matchScore={review.matchScore || 0}
          detailedMatches={review.detailedMatches}
          isNewReview={review.isNewReview}
          isClaimingReview={isClaimingReview}
          onClaimClick={handleDirectClaimClick}
          isReviewClaimed={isReviewActuallyClaimed}
        />
      )}
      
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
        shouldShowClaimButton={shouldShowClaimButton()}
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
        onClaimClick={handleDirectClaimClick}
        onUnclaimClick={handleDirectUnclaimClick}
        onReactionToggle={handleReactionToggle}
        onSubmitResponse={handleSubmitResponse}
        onDeleteResponse={handleDeleteResponse}
        onSubscribeClick={handleSubscribeClick}
        onUseCreditClick={handleUseCreditClick}
        isReviewClaimed={isReviewActuallyClaimed}
        isClaimingReview={isClaimingReview}
      />

      <div className="flex justify-between items-center mt-4">
        <div></div>
        {canReport && <ReportReviewButton reviewId={review.id} />}
      </div>
    </div>
  );
};

export default EnhancedCustomerReviewCard;
