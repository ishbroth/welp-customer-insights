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
import CustomerInfoDisplay from "@/components/review/CustomerInfoDisplay";
import { useCustomerInfo } from "@/hooks/useCustomerInfo";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";

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
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // CRITICAL: Log the raw review data first
  console.log('EnhancedCustomerReviewCard: RAW REVIEW DATA:', {
    reviewId: review.id,
    customerId_from_review: review.customerId,
    customerId_exists: !!review.customerId,
    currentUserId: currentUser?.id,
    matchType: review.matchType,
    hasSubscription,
    isUnlocked
  });

  // Use enhanced customer info system with proper claim status
  const customerInfo = useCustomerInfo({
    customer_name: review.customerName,
    customer_phone: review.customer_phone,
    customer_address: review.customer_address,
    customer_city: review.customer_city,
    customer_zipcode: review.customer_zipcode,
    customerId: review.customerId, // This is the source of truth for claim status
    matchScore: review.matchScore,
    matchType: review.matchType
  });

  // CRITICAL: Log the processed customer info
  console.log('EnhancedCustomerReviewCard: PROCESSED CUSTOMER INFO:', {
    reviewId: review.id,
    customerInfo_isClaimed: customerInfo.isClaimed,
    customerInfo_name: customerInfo.name,
    customerInfo_matchType: customerInfo.matchType,
    raw_customerId: review.customerId
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

  // CRITICAL: Log the user permission context
  console.log('EnhancedCustomerReviewCard: USER PERMISSION CONTEXT:', {
    reviewId: review.id,
    isReviewAuthor,
    isCustomerBeingReviewed,
    isBusinessUser,
    isCustomerUser,
    actualClaimStatus_from_DB: !!review.customerId,
    customerInfo_claimStatus: customerInfo.isClaimed,
    currentUser_id: currentUser?.id,
    review_customerId: review.customerId
  });

  // FIXED: Use ONLY the database claim status - ignore customerInfo processing
  const actuallyClaimedInDB = !!review.customerId;
  
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
    isReviewClaimed: actuallyClaimedInDB, // Use ONLY database status
    hasSubscription,
    isUnlocked,
  });

  // CRITICAL: Log the final permission decisions
  console.log('EnhancedCustomerReviewCard: FINAL PERMISSION DECISIONS:', {
    reviewId: review.id,
    actuallyClaimedInDB,
    canReact: canReact(),
    canRespond: canRespond(),
    shouldShowFullReview: shouldShowFullReview(),
    shouldShowClaimButton: shouldShowClaimButton(),
    shouldShowRespondButton: shouldShowRespondButton(),
    will_show_response_field: shouldShowRespondButton() && canRespond(),
    will_show_claim_button: shouldShowClaimButton() && !actuallyClaimedInDB
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

  const handleCustomerClick = () => {
    // FIXED: Only allow navigation for actually claimed reviews
    if (!actuallyClaimedInDB) return;
    
    navigate(`/customer-profile/${review.customerId}`, {
      state: { 
        readOnly: true,
        showWriteReviewButton: currentUser?.type === 'business'
      }
    });
  };

  // Business info for left side (larger)
  const businessDisplayName = businessProfile?.name || review.reviewerName || 'Business';
  const businessInfo = {
    name: businessDisplayName,
    avatar: finalBusinessAvatar,
    initials: getInitials(businessDisplayName),
    verified: businessProfile?.verified || false
  };

  // Determine if business name should be clickable - only if unlocked or has subscription
  const shouldBusinessNameBeClickable = isUnlocked || hasSubscription;

  console.log('EnhancedCustomerReviewCard: Final permission decisions:', {
    reviewId: review.id,
    canReact: canReact(),
    canRespond: canRespond(),
    shouldShowFullReview: shouldShowFullReview(),
    shouldShowClaimButton: shouldShowClaimButton(),
    shouldShowRespondButton: shouldShowRespondButton(),
    actualClaimStatus: !!review.customerId,
    customerInfoClaimStatus: customerInfo.isClaimed,
    showResponseField: canRespond() && customerInfo.isClaimed
  });

  // CRITICAL: Override customerInfo for display to ensure correct claim status
  const displayCustomerInfo = {
    ...customerInfo,
    isClaimed: actuallyClaimedInDB // Force to use database status
  };

  console.log('EnhancedCustomerReviewCard: DISPLAY DECISION:', {
    reviewId: review.id,
    will_show_match_info: !actuallyClaimedInDB,
    will_show_claim_in_match_info: !actuallyClaimedInDB,
    actuallyClaimedInDB,
    displayCustomerInfo_isClaimed: displayCustomerInfo.isClaimed
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border mb-4 relative">
      {/* FIXED: Show match info and claim button for unclaimed reviews ONLY */}
      {!actuallyClaimedInDB && (
        <ReviewMatchInfo
          matchType={review.matchType}
          matchReasons={review.matchReasons}
          matchScore={review.matchScore}
          detailedMatches={review.detailedMatches}
          isNewReview={review.isNewReview}
          isClaimingReview={isClaimingReview}
          onClaimClick={handleClaimClick}
          isReviewClaimed={actuallyClaimedInDB}
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
              {shouldBusinessNameBeClickable ? (
                <h3 
                  className="font-semibold text-lg cursor-pointer hover:text-blue-600 transition-colors text-blue-600 hover:underline"
                  onClick={handleBusinessNameClick}
                >
                  {businessInfo.name}
                </h3>
              ) : (
                <h3 className="font-semibold text-lg text-gray-900">
                  {businessInfo.name}
                </h3>
              )}
              {businessInfo.verified && <VerifiedBadge size="sm" />}
            </div>
            <p className="text-sm text-gray-500">
              Review written on {formatDate(review.date)}
            </p>
            <p className="text-sm text-gray-500">Business</p>
          </div>
        </div>

        {/* Customer info - right side (smaller) using enhanced component */}
        <CustomerInfoDisplay
          customerInfo={displayCustomerInfo}
          onCustomerClick={displayCustomerInfo.isClaimed ? handleCustomerClick : undefined}
          size="small"
          showContactInfo={true}
        />
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
        onClaimClick={handleClaimClick}
        onReactionToggle={handleReactionToggle}
        onSubmitResponse={handleSubmitResponse}
        onDeleteResponse={handleDeleteResponse}
      />

      {/* Moved report button to right side next to reactions */}
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
