
import React from "react";
import { Eye, Lock, CreditCard } from "lucide-react";
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
  creditBalance: number;
  onPurchaseClick: () => void;
  onClaimClick: () => void;
  onReactionToggle: (reviewId: string, reactionType: string) => void;
  onSubmitResponse?: (content: string) => Promise<boolean>;
  onDeleteResponse?: (responseId: string) => void;
  onSubscribeClick: () => void;
  onUseCreditClick: () => void;
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
  creditBalance,
  onPurchaseClick,
  onClaimClick,
  onReactionToggle,
  onSubmitResponse,
  onDeleteResponse,
  onSubscribeClick,
  onUseCreditClick,
}) => {
  // CRITICAL: Log what we're about to render
  console.log('EnhancedReviewContent: RENDERING DECISIONS:', {
    reviewId,
    customerId,
    shouldShowFullReview,
    shouldShowClaimButton,
    shouldShowRespondButton,
    canRespond,
    creditBalance,
    hasSubscription,
    isUnlocked,
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
              To respond, you must <button 
                onClick={onClaimClick}
                className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
              >
                claim this review
              </button>.
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
        <div className="flex items-center text-gray-600 mb-2">
          <Lock className="h-4 w-4 mr-2" />
          <span className="text-sm">Full review locked</span>
        </div>
        <p className="text-xs text-gray-500 mb-3">
          {creditBalance > 0 
            ? "Use a credit to unlock this review, or subscribe for unlimited access"
            : "Purchase credits or subscribe to view the complete review"
          }
        </p>
        <div className="flex gap-2">
          {creditBalance > 0 ? (
            <Button
              size="sm"
              onClick={onUseCreditClick}
              className="flex-1"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Use 1 Credit
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={onPurchaseClick}
              className="flex-1"
            >
              Buy Credits ($3 each)
            </Button>
          )}
          <Button
            size="sm"
            onClick={onSubscribeClick}
            className="flex-1"
          >
            Subscribe
          </Button>
        </div>
      </div>
      
      {/* CRITICAL: Show claim button for unclaimed reviews even when locked */}
      {shouldShowClaimButton && (
        <div className="mt-4 flex justify-end">
          <p className="text-sm text-gray-500">
            To respond, you must <button 
              onClick={onClaimClick}
              className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              claim this review
            </button>.
          </p>
        </div>
      )}
    </div>
  );
};

export default EnhancedReviewContent;
