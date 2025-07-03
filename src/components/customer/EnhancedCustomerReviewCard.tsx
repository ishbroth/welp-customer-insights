
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
  
  // CRITICAL: Use ONLY the database customerId to determine if review is claimed
  const isReviewActuallyClaimed = !!review.customerId;
  
  console.log('EnhancedCustomerReviewCard: CORE CLAIM STATUS CHECK:', {
    reviewId: review.id,
    review_customerId: review.customerId,
    isReviewActuallyClaimed,
    currentUserId: currentUser?.id,
    userType: currentUser?.type,
    matchType: review.matchType,
    matchScore: review.matchScore,
    matchReasons: review.matchReasons
  });

  // Use enhanced customer info system for display purposes only
  const customerInfo = useCustomerInfo({
    customer_name: review.customerName,
    customer_phone: review.customer_phone,
    customer_address: review.customer_address,
    customer_city: review.customer_city,
    customer_zipcode: review.customer_zipcode,
    customerId: review.customerId,
    matchScore: review.matchScore,
    matchType: review.matchType
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

  console.log('EnhancedCustomerReviewCard: USER CONTEXT FOR PERMISSIONS:', {
    reviewId: review.id,
    currentUserId: currentUser?.id,
    isReviewAuthor,
    isCustomerBeingReviewed,
    isBusinessUser,
    isCustomerUser,
    isReviewActuallyClaimed,
    review_customerId: review.customerId
  });

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
    isReviewClaimed: isReviewActuallyClaimed, // Use ONLY database status
    hasSubscription,
    isUnlocked,
  });

  // Force showing claim button for unclaimed reviews when user is customer
  const forceShowClaimButton = isCustomerUser && !isReviewActuallyClaimed && !isReviewAuthor;
  const actualShouldShowClaimButton = forceShowClaimButton || shouldShowClaimButton();

  console.log('EnhancedCustomerReviewCard: FINAL RENDER DECISIONS:', {
    reviewId: review.id,
    isReviewActuallyClaimed,
    shouldShowClaimButton: shouldShowClaimButton(),
    forceShowClaimButton,
    actualShouldShowClaimButton,
    shouldShowRespondButton: shouldShowRespondButton(),
    canReact: canReact(),
    canRespond: canRespond(),
    shouldShowFullReview: shouldShowFullReview(),
    willRenderMatchInfo: !isReviewActuallyClaimed,
    matchType: review.matchType,
    matchScore: review.matchScore
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
    // Only allow navigation for actually claimed reviews
    if (!isReviewActuallyClaimed) return;
    
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

  // Force display customer info to use actual claim status
  const displayCustomerInfo = {
    ...customerInfo,
    isClaimed: isReviewActuallyClaimed // Force to use database status
  };

  console.log('EnhancedCustomerReviewCard: DISPLAY DECISION:', {
    reviewId: review.id,
    will_show_match_info: !isReviewActuallyClaimed,
    will_show_claim_in_match_info: actualShouldShowClaimButton,
    actuallyClaimedInDB: isReviewActuallyClaimed,
    displayCustomerInfo_isClaimed: displayCustomerInfo.isClaimed,
    matchType: review.matchType,
    matchScore: review.matchScore,
    hasMatchData: !!(review.matchType || review.matchScore)
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border mb-4 relative">
      {/* CRITICAL: Always show match info for unclaimed reviews, regardless of other conditions */}
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
