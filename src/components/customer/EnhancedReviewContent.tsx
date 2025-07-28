
import React from "react";
import { Eye, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReviewReactions from "@/components/ReviewReactions";
import CustomerReviewResponse from "./CustomerReviewResponse";
import { getFirstThreeLetters } from "./enhancedReviewCardUtils";

interface EnhancedReviewContentProps {
  content: string;
  shouldShowFullReview: boolean;
  canReact: boolean;
  canRespond: boolean;
  shouldShowClaimButton: boolean;
  shouldShowRespondButton: boolean;
  reviewId: string;
  customerId?: string;
  reviewerId: string;
  reviewerName: string;
  finalBusinessAvatar: string;
  reactions: any;
  responses: any[];
  hasSubscription: boolean;
  isUnlocked: boolean;
  onPurchaseClick: () => void;
  onClaimClick: () => void;
  onReactionToggle: (reviewId: string, reactionType: string) => void;
  onSubmitResponse?: (content: string) => Promise<boolean>;
  onDeleteResponse?: (responseId: string) => void;
}

const EnhancedReviewContent: React.FC<EnhancedReviewContentProps> = ({
  content,
  shouldShowFullReview,
  canReact,
  canRespond,
  shouldShowClaimButton,
  shouldShowRespondButton,
  reviewId,
  customerId,
  reviewerId,
  reviewerName,
  finalBusinessAvatar,
  reactions,
  responses,
  hasSubscription,
  isUnlocked,
  onPurchaseClick,
  onClaimClick,
  onReactionToggle,
  onSubmitResponse,
  onDeleteResponse,
}) => {
  // CRITICAL: Log what we're about to render
  console.log('EnhancedReviewContent: RENDERING DECISIONS:', {
    reviewId,
    customerId,
    shouldShowFullReview,
    shouldShowClaimButton,
    shouldShowRespondButton,
    canRespond,
    willShowClaimButton: shouldShowClaimButton,
    willShowResponseComponent: shouldShowRespondButton,
    isReviewClaimed: !!customerId
  });

  if (shouldShowFullReview) {
    return (
      <div>
        <p className="text-gray-700">{content}</p>
        <div className="mt-2 text-sm text-green-600 flex items-center">
          <Eye className="h-4 w-4 mr-1" />
          Full review unlocked
        </div>
        
        {canReact && (
          <div className="mt-4 border-t pt-3">
            <div className="text-sm text-gray-500 mb-1">React to this review:</div>
            <ReviewReactions 
              reviewId={reviewId}
              customerId={customerId}
              businessId={reviewerId}
              businessName={reviewerName}
              businessAvatar={finalBusinessAvatar}
              reactions={reactions}
              onReactionToggle={onReactionToggle}
            />
          </div>
        )}
        
        {/* CRITICAL: Only show response component if review is claimed AND user is the one who claimed it */}
        {shouldShowRespondButton && (
          <CustomerReviewResponse 
            reviewId={reviewId}
            responses={responses || []}
            hasSubscription={hasSubscription}
            isOneTimeUnlocked={isUnlocked && !hasSubscription}
            hideReplyOption={false}
            onResponseSubmitted={(response) => {
              console.log('Response submitted in EnhancedReviewContent:', response);
            }}
            reviewAuthorId={reviewerId}
            onSubmitResponse={onSubmitResponse}
            onDeleteResponse={onDeleteResponse}
          />
        )}
        
        {/* CRITICAL: Show claim button for unclaimed reviews */}
        {shouldShowClaimButton && (
          <div className="mt-4 flex justify-end">
            <p className="text-sm text-gray-500">
              To respond to this review, <button 
                onClick={onClaimClick}
                className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
              >
                claim this review
              </button>!
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <p className="text-gray-700">{getFirstThreeLetters(content)}</p>
      <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-600">
            <Lock className="h-4 w-4 mr-2" />
            <span>Unlock full review for $3</span>
          </div>
          <Button 
            onClick={onPurchaseClick}
            size="sm"
          >
            Purchase
          </Button>
        </div>
      </div>
      
      {/* CRITICAL: Show claim button for unclaimed reviews even when locked */}
      {shouldShowClaimButton && (
        <div className="mt-4 flex justify-end">
          <p className="text-sm text-gray-500">
            To respond to this review, <button 
              onClick={onClaimClick}
              className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              claim this review
            </button>!
          </p>
        </div>
      )}
    </div>
  );
};

export default EnhancedReviewContent;
