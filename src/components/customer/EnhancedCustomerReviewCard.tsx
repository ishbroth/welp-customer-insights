
import React from "react";
import { Eye, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { Review } from "@/types";
import ReviewReactions from "@/components/ReviewReactions";
import CustomerReviewResponse from "@/components/customer/CustomerReviewResponse";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import ClaimReviewDialog from "@/components/customer/ClaimReviewDialog";
import ReviewMatchInfo from "@/components/customer/ReviewMatchInfo";
import ReviewCustomerAvatar from "@/components/customer/ReviewCustomerAvatar";
import { useEnhancedCustomerReviewCard } from "@/hooks/useEnhancedCustomerReviewCard";
import { useReviewPermissions } from "@/components/customer/useReviewPermissions";
import { getBusinessInitials, getFirstThreeWords } from "./enhancedReviewCardUtils";

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
    isVerified,
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
  } = useReviewPermissions({
    isCustomerUser,
    isBusinessUser,
    isCustomerBeingReviewed,
    isReviewAuthor,
    isReviewClaimed,
    hasSubscription,
    isUnlocked,
  });

  // Get phone number to display
  const displayPhone = review.customer_phone || customerProfile?.phone;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border mb-4">
      <ReviewMatchInfo
        matchType={review.matchType}
        matchReasons={review.matchReasons}
        matchScore={review.matchScore}
        detailedMatches={review.detailedMatches}
        isNewReview={review.isNewReview}
        isClaimingReview={isClaimingReview}
        onClaimClick={handleClaimClick}
      />
      
      <div className="flex justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              {finalBusinessAvatar ? (
                <AvatarImage src={finalBusinessAvatar} alt={review.reviewerName} />
              ) : (
                <AvatarFallback className="bg-blue-100 text-blue-800">
                  {getBusinessInitials(review.reviewerName)}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                {(isUnlocked) ? (
                  <h3 
                    className="font-semibold cursor-pointer text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                    onClick={handleBusinessNameClick}
                  >
                    {review.reviewerName}
                  </h3>
                ) : (
                  <h3 className="font-semibold">{review.reviewerName}</h3>
                )}
                {isVerified && <VerifiedBadge size="sm" />}
              </div>
              <p className="text-sm text-gray-500">
                {new Date(review.date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        
        <ReviewCustomerAvatar
          customerName={review.customerName}
          customerAvatar={finalCustomerAvatar}
          displayPhone={displayPhone}
        />
      </div>

      {shouldShowFullReview() ? (
        <div>
          <p className="text-gray-700">{review.content}</p>
          <div className="mt-2 text-sm text-green-600 flex items-center">
            <Eye className="h-4 w-4 mr-1" />
            Full review unlocked
          </div>
          
          {canReact() && (
            <div className="mt-4 border-t pt-3">
              <div className="text-sm text-gray-500 mb-1">React to this review:</div>
              <ReviewReactions 
                reviewId={review.id}
                customerId={review.customerId}
                businessId={review.reviewerId}
                businessName={review.reviewerName}
                businessAvatar={finalBusinessAvatar}
                reactions={reactions}
                onReactionToggle={handleReactionToggle}
              />
            </div>
          )}
          
          {canRespond() && (
            <CustomerReviewResponse 
              reviewId={review.id}
              responses={review.responses || []}
              hasSubscription={hasSubscription}
              isOneTimeUnlocked={isUnlocked && !hasSubscription}
              hideReplyOption={false}
              onResponseSubmitted={() => {}}
              reviewAuthorId={review.reviewerId}
            />
          )}
          
          {shouldShowClaimButton() && (
            <div className="mt-4 flex justify-end">
              <p className="text-sm text-gray-500">
                To Respond, <button 
                  onClick={handleClaimClick}
                  className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                >
                  Claim this Review
                </button>!
              </p>
            </div>
          )}
        </div>
      ) : (
        <div>
          <p className="text-gray-700">{getFirstThreeWords(review.content)}</p>
          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-gray-600">
                <Lock className="h-4 w-4 mr-2" />
                <span>Unlock full review for $3</span>
              </div>
              <Button 
                onClick={handlePurchaseClick}
                size="sm"
              >
                Purchase
              </Button>
            </div>
          </div>
          
          {shouldShowClaimButton() && (
            <div className="mt-4 flex justify-end">
              <p className="text-sm text-gray-500">
                To Respond, <button 
                  onClick={handleClaimClick}
                  className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                >
                  Claim this Review
                </button>!
              </p>
            </div>
          )}
        </div>
      )}

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
        onConfirm={handleClaimConfirm}
        onCancel={handleClaimCancel}
      />
    </div>
  );
};

export default EnhancedCustomerReviewCard;
