import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Lock, CreditCard, Crown, CheckCircle, UserCheck, UserX } from "lucide-react";
import ReviewReactions from "@/components/customer/ReviewReactions";

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
  finalBusinessAvatar?: string;
  reactions: any;
  responses: any[];
  hasSubscription: boolean;
  isUnlocked: boolean;
  creditBalance: number;
  currentUser?: any;
  onPurchaseClick: () => void;
  onClaimClick: () => void;
  onUnclaimClick: () => void;
  onReactionToggle: (reactionType: string) => void;
  onSubmitResponse: (content: string) => Promise<boolean>;
  onDeleteResponse: (responseId: string) => void;
  onSubscribeClick: () => void;
  onUseCreditClick: () => void;
  isReviewClaimed: boolean;
  isClaimingReview: boolean;
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
  currentUser,
  onPurchaseClick,
  onClaimClick,
  onUnclaimClick,
  onReactionToggle,
  onSubmitResponse,
  onDeleteResponse,
  onSubscribeClick,
  onUseCreditClick,
  isReviewClaimed,
  isClaimingReview,
}) => {
  const [showResponseForm, setShowResponseForm] = useState(false);

  const getPreviewText = (text: string) => {
    return text.substring(0, 50) + '...';
  };

  const handleResponseSubmit = async (content: string) => {
    const success = await onSubmitResponse(content);
    if (success) {
      setShowResponseForm(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Review Content */}
      <div>
        {shouldShowFullReview ? (
          <p className="text-gray-700 leading-relaxed">{content}</p>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-700 leading-relaxed">{getPreviewText(content)}</p>
            
            {/* Access Options Card */}
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center text-gray-600 mb-3">
                  <Lock className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">Full review content locked</span>
                </div>
                
                <p className="text-xs text-gray-500 mb-4">
                  Choose an option to unlock this review and view the complete content
                </p>
                
                <div className="space-y-3">
                   {/* Credit/Purchase Option */}
                   {creditBalance > 0 ? (
                     <Button
                       onClick={onUseCreditClick}
                       variant="outline"
                       className="w-full flex items-center justify-center gap-2"
                     >
                       <CreditCard className="h-4 w-4" />
                       Unlock with 1 Credit
                     </Button>
                   ) : (
                     <Button
                       onClick={onPurchaseClick}
                       variant="outline"
                       className="w-full flex items-center justify-center gap-2"
                     >
                       <CreditCard className="h-4 w-4" />
                       Unlock Review ($3)
                     </Button>
                   )}
                   
                   {/* Subscription Option */}
                   <Button
                     onClick={onSubscribeClick}
                     className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
                   >
                     <Crown className="h-4 w-4" />
                     Subscribe Now
                   </Button>
                 </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Reactions - only show if can react */}
      {canReact && (
        <ReviewReactions
          reactions={reactions}
          onReactionToggle={onReactionToggle}
        />
      )}


      {/* Unclaim Option - only show if review is claimed by current user */}
      {isReviewClaimed && shouldShowFullReview && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={onUnclaimClick}
            disabled={isClaimingReview}
            className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            <UserX className="h-4 w-4" />
            {isClaimingReview ? "Processing..." : "Un-claim this review"}
          </button>
        </div>
      )}
    </div>
  );
};

export default EnhancedReviewContent;
