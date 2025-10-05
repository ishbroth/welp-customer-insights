import React from "react";
import { useNavigate } from "react-router-dom";
import { Review } from "@/types";
import ReviewMatchInfo from "./ReviewMatchInfo";
import EnhancedReviewContent from "./EnhancedReviewContent";
import ReportReviewButton from "./ReportReviewButton";
import ReviewConversationSection from "@/components/conversation/ReviewConversationSection";
import { useEnhancedCustomerReviewCard } from "@/hooks/useEnhancedCustomerReviewCard";
import { useReviewPermissions } from "./useReviewPermissions";

import { useAuth } from "@/contexts/auth";
import { useCredits } from "@/hooks/useCredits";
import { useReviewAccess } from "@/hooks/useReviewAccess";
import { supabase } from "@/integrations/supabase/client";
import { useCustomerReviewCardHeader } from "./hooks/useCustomerReviewCardHeader";
import CustomerReviewCardHeader from "./CustomerReviewCardHeader";
import { Star } from "lucide-react";
import { toast } from "@/components/ui/sonner";

interface DetailedMatch {
  field: string;
  reviewValue: string;
  searchValue: string;
  similarity: number;
  matchType: 'exact' | 'partial' | 'fuzzy' | 'no_match';
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
    customer_address?: string;
    customer_city?: string;
    customer_zipcode?: string;
    hasUserResponded?: boolean;
    matchesCurrentUser?: boolean;
  };
  isUnlocked: boolean;
  hasSubscription: boolean;
  onPurchase: (reviewId: string) => void;
  onReactionToggle: (reviewId: string, reactionType: string) => void;
  // Props for anonymous business masking
  maskBusinessName?: boolean;
  businessCategory?: string;
  actualBusinessName?: string;
}

const EnhancedCustomerReviewCard: React.FC<EnhancedCustomerReviewCardProps> = ({
  review,
  isUnlocked,
  hasSubscription,
  onPurchase,
  onReactionToggle,
  maskBusinessName = false,
  businessCategory,
  actualBusinessName,
}) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { balance, useCredits: useCreditsFn, loadCreditsData } = useCredits();
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
    maskBusinessName,
    businessCategory,
    actualBusinessName,
  });

  const handleSubscribeClick = () => {
    navigate('/customer-benefits');
  };

  const handleUseCreditClick = async () => {
    if (balance < 1) {
      toast.error("Insufficient credits");
      return;
    }

    const result = await useCreditsFn(1, `Unlocked review ${review.id}`);
    if (result.success) {
      // Claim the review with the transaction ID
      const claimed = await addUnlockedReview(review.id, result.transactionId);
      
      if (claimed) {
        loadCreditsData(); // Refresh credit balance
        toast.success("Review unlocked using 1 credit!");
      } else {
        toast.error("This review has already been claimed by another user.");
      }
    }
  };

  // Check if customer user can unlock this specific review
  const canCustomerUnlockReview = () => {
    if (!isCustomerUser) return true; // Business users can unlock any review
    // Customer users can only unlock reviews that match their profile
    return review.matchesCurrentUser;
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


  const { businessInfo, customerInfo, handleCustomerClick } = useCustomerReviewCardHeader(
    review,
    businessProfile,
    finalBusinessAvatar,
    isReviewActuallyUnlocked, // Use actual unlock/claim status
    currentUser
  );

  const finalBusinessVerified = review.reviewerVerified || businessProfile?.verified || false;
  const enhancedBusinessInfo = {
    ...businessInfo,
    verified: finalBusinessVerified
  };

  const businessDisplayName = enhancedBusinessInfo.name;

  // Enhanced customer info - use the avatar from customerInfo (which includes claimed customer data)
  const enhancedCustomerInfo = {
    ...customerInfo
  };

  // Render stars - show actual rating if unlocked, grayed out if locked
  const renderStars = (rating: number) => {
    const shouldShowRating = isReviewActuallyUnlocked || hasSubscription;
    
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-5 w-5 md:h-4 md:w-4 ${
          shouldShowRating && index < rating
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const canReport = hasSubscription || isReviewActuallyUnlocked;

  return (
    <div className="bg-white px-3 py-3 md:px-4 md:py-4 rounded-lg shadow-sm border mb-3 relative">
      
      <div className="flex justify-between mb-3">
        <CustomerReviewCardHeader
          businessInfo={enhancedBusinessInfo}
          customerInfo={enhancedCustomerInfo}
          reviewDate={review.date}
          shouldBusinessNameBeClickable={true}
          onBusinessNameClick={handleBusinessNameClick}
          onCustomerClick={handleCustomerClick}
          isAnonymous={review.is_anonymous || false}
        />
      </div>

      <div className="flex items-center gap-2 mb-3">
        <div className="flex">{renderStars(review.rating)}</div>
        <span className="text-sm md:text-sm text-gray-500">
          {new Date(review.date).toLocaleDateString()}
        </span>
      </div>

      <EnhancedReviewContent
        content={review.content}
        shouldShowFullReview={shouldShowFullReview()}
        canReact={canReact()}
        canRespond={false}
        shouldShowClaimButton={false}
        shouldShowRespondButton={shouldShowRespondButton()}
        reviewId={review.id}
        customerId={review.customerId}
        reviewerId={review.reviewerId}
        reviewerName={businessDisplayName}
        finalBusinessAvatar={finalBusinessAvatar}
        reactions={reactions}
        responses={[]}
        hasSubscription={hasSubscription}
        isUnlocked={isReviewActuallyUnlocked}
        creditBalance={canCustomerUnlockReview() ? balance : 0}
        currentUser={currentUser}
        onPurchaseClick={canCustomerUnlockReview() ? handlePurchaseClick : () => {}}
        onClaimClick={() => {}}
        onUnclaimClick={() => {}}
        onReactionToggle={(reactionType: string) => handleReactionToggle(review.id, reactionType)}
        onSubmitResponse={async () => false}
        onDeleteResponse={() => {}}
        onSubscribeClick={canCustomerUnlockReview() ? handleSubscribeClick : () => {}}
        onUseCreditClick={canCustomerUnlockReview() ? handleUseCreditClick : () => {}}
        isReviewClaimed={false}
        isClaimingReview={false}
        matchType={review.matchType || 'potential'}
        matchReasons={review.matchReasons || ['Potential match found']}
        matchScore={review.matchScore || 0}
        detailedMatches={review.detailedMatches}
        isNewReview={review.isNewReview}
        hideMatchScore={isReviewActuallyUnlocked || review.hasUserResponded || hasSubscription}
        canUnlockReview={canCustomerUnlockReview()}
        customerName={review.customerName}
        customerAddress={review.customer_address}
        customerCity={review.customer_city}
        customerZipcode={review.customer_zipcode}
        customerPhone={review.customer_phone}
      />

      {/* Conversation Section */}
      <ReviewConversationSection 
        reviewId={review.id}
        shouldShowFullReview={shouldShowFullReview()}
        isBusinessUser={false}
        isCustomerBeingReviewed={isCustomerBeingReviewed}
        customerId={review.customerId}
        className="mt-4"
      />

      <div className="flex justify-between items-center mt-4">
        <div></div>
        {canReport && <ReportReviewButton reviewId={review.id} />}
      </div>
    </div>
  );
};

export default EnhancedCustomerReviewCard;
