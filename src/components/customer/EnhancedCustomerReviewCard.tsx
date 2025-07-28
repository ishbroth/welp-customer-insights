
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Review } from "@/types";
import ReviewMatchInfo from "./ReviewMatchInfo";
import EnhancedReviewContent from "./EnhancedReviewContent";
import ClaimReviewDialog from "./ClaimReviewDialog";
import SimpleClaimConfirmDialog from "./SimpleClaimConfirmDialog";
import ReportReviewButton from "./ReportReviewButton";
import { useEnhancedCustomerReviewCard } from "@/hooks/useEnhancedCustomerReviewCard";
import { useReviewPermissions } from "./useReviewPermissions";
import { useCustomerResponseManagement } from "@/hooks/useCustomerResponseManagement";
import { useReviewClaiming } from "@/hooks/useReviewClaiming";
import { useAuth } from "@/contexts/auth";
import { useCredits } from "@/hooks/useCredits";
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
  const { claimReview, isClaimingReview } = useReviewClaiming();
  const [showSimpleClaimDialog, setShowSimpleClaimDialog] = useState(false);
  const [localIsClaimedState, setLocalIsClaimedState] = useState(review.isClaimed || false);
  const [localIsUnlockedState, setLocalIsUnlockedState] = useState(isUnlocked);
  
  // Use local state for immediate UI updates, fallback to original review state
  const isReviewActuallyClaimed = localIsClaimedState || review.isClaimed === true;
  const isReviewActuallyUnlocked = localIsUnlockedState || isUnlocked;

  console.log('🎯 EnhancedCustomerReviewCard: CRITICAL DEBUG', {
    reviewId: review.id,
    customerId: review.customerId,
    originalIsClaimed: review.isClaimed,
    localIsClaimedState,
    isReviewActuallyClaimed,
    localIsUnlockedState,
    isReviewActuallyUnlocked,
    creditBalance: balance,
    hasSubscription,
    matchType: review.matchType,
    matchScore: review.matchScore,
    currentUserId: currentUser?.id,
  });

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
    handlePurchaseClick,
    handleClaimClick,
    handleClaimCancel,
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

  // Handle credit usage
  const handleUseCreditClick = async () => {
    if (balance < 1) {
      toast.error("Insufficient credits");
      return;
    }

    const success = await useCreditsFn(1, `Unlocked review ${review.id}`);
    if (success) {
      setLocalIsUnlockedState(true);
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

  // Handle simple claim confirmation
  const handleSimpleClaimClick = () => {
    setShowSimpleClaimDialog(true);
  };

  const handleSimpleClaimConfirm = async () => {
    console.log('🎯 Starting claim process for review:', review.id);
    const success = await claimReview(review.id);
    
    if (success) {
      console.log('🎯 Claim successful! Updating UI state immediately...');
      
      // Update local state immediately for instant UI feedback
      setLocalIsClaimedState(true);
      setShowSimpleClaimDialog(false);
      
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

  const handleSimpleClaimCancel = () => {
    setShowSimpleClaimDialog(false);
  };

  // Enhanced customer info to show claimed status and include avatar
  const enhancedCustomerInfo = {
    ...customerInfo,
    isClaimed: isReviewActuallyClaimed,
    avatar: review.customerAvatar || ''
  };

  // Render stars for preview
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 text-gray-300`}
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
          onClaimClick={handleSimpleClaimClick}
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
        onClaimClick={handleSimpleClaimClick}
        onReactionToggle={handleReactionToggle}
        onSubmitResponse={handleSubmitResponse}
        onDeleteResponse={handleDeleteResponse}
        onSubscribeClick={handleSubscribeClick}
        onUseCreditClick={handleUseCreditClick}
      />

      <div className="flex justify-between items-center mt-4">
        <div></div>
        {canReport && <ReportReviewButton reviewId={review.id} />}
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
        onConfirm={handleClaimClick}
        onCancel={handleClaimCancel}
      />

      <SimpleClaimConfirmDialog
        open={showSimpleClaimDialog}
        onOpenChange={setShowSimpleClaimDialog}
        onConfirm={handleSimpleClaimConfirm}
        isLoading={isClaimingReview}
      />
    </div>
  );
};

export default EnhancedCustomerReviewCard;
