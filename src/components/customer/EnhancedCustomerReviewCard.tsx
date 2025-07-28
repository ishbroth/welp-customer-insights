
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
import { useCustomerReviewCardHeader } from "./hooks/useCustomerReviewCardHeader";
import CustomerReviewCardHeader from "./CustomerReviewCardHeader";
import { Star } from "lucide-react";

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
  const { claimReview, isClaimingReview } = useReviewClaiming();
  const [showSimpleClaimDialog, setShowSimpleClaimDialog] = useState(false);
  const [isExplicitlyClaimed, setIsExplicitlyClaimed] = useState(review.isExplicitlyClaimed || false);
  
  // CRITICAL: Check if review is actually claimed using the database customer_id field
  const isReviewActuallyClaimed = !!review.customerId;

  console.log('🎯 EnhancedCustomerReviewCard: CRITICAL DEBUG', {
    reviewId: review.id,
    database_customerId: review.customerId,
    matchType: review.matchType,
    matchScore: review.matchScore,
    isExplicitlyClaimed,
    isReviewActuallyClaimed,
    currentUserId: currentUser?.id,
    isCustomerBeingReviewed: review.customerId === currentUser?.id,
    IMPORTANT_NOTE: 'isReviewActuallyClaimed is true when customer_id exists in database'
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
    isUnlocked,
    hasSubscription,
    onPurchase,
    onReactionToggle,
  });

  // Handle subscribe button click to go to customer benefits page
  const handleSubscribeClick = () => {
    navigate('/customer-benefits');
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

  // CRITICAL: Use the permission system with the ACTUAL claim status
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

  // CRITICAL: Use review.reviewerVerified (from matching logic) as the authoritative verification status
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
      console.log('🎯 Claim successful! Updating UI state...');
      setIsExplicitlyClaimed(true); // Update local state immediately
      setShowSimpleClaimDialog(false);
      
      // Trigger parent component refresh
      if (onClaimSuccess) {
        console.log('🎯 Calling onClaimSuccess to refresh parent data...');
        onClaimSuccess();
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

  // Check if user has access to report (subscription or paid access)
  const canReport = hasSubscription || isUnlocked;

  console.log('🎯 Final Render Decisions:', {
    reviewId: review.id,
    isReviewActuallyClaimed,
    shouldShowClaimButton: shouldShowClaimButton(),
    shouldShowRespondButton: shouldShowRespondButton(),
    businessVerified: finalBusinessVerified,
    businessName: businessDisplayName,
    matchType: review.matchType,
    canReport,
    CRITICAL_VERIFICATION_FLOW: {
      reviewerVerified: review.reviewerVerified,
      businessProfileVerified: businessProfile?.verified,
      finalBusinessVerified
    }
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border mb-4 relative">
      {/* CRITICAL: Show match info ONLY for unclaimed reviews */}
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
          shouldBusinessNameBeClickable={isUnlocked || hasSubscription}
          onBusinessNameClick={handleBusinessNameClick}
          onCustomerClick={handleCustomerClick}
        />
      </div>

      {/* Rating stars - always show grayed out in preview */}
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
        isUnlocked={isUnlocked}
        onPurchaseClick={handlePurchaseClick}
        onClaimClick={handleSimpleClaimClick}
        onReactionToggle={handleReactionToggle}
        onSubmitResponse={handleSubmitResponse}
        onDeleteResponse={handleDeleteResponse}
        onSubscribeClick={handleSubscribeClick}
      />

      <div className="flex justify-between items-center mt-4">
        <div></div>
        {/* Only show report button if user has subscription or paid access */}
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
