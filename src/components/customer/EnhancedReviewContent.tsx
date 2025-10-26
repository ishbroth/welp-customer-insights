import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Lock, CreditCard, Crown, CheckCircle, UserCheck, UserX } from "lucide-react";
import ReviewReactions from "@/components/customer/ReviewReactions";
import ReviewMatchInfo from "@/components/customer/ReviewMatchInfo";

interface DetailedMatch {
  field: string;
  reviewValue: string;
  searchValue: string;
  similarity: number;
  matchType: 'exact' | 'partial' | 'fuzzy' | 'no_match';
}

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
  matchType?: 'high_quality' | 'potential';
  matchReasons?: string[];
  matchScore?: number;
  detailedMatches?: DetailedMatch[];
  isNewReview?: boolean;
  hideMatchScore?: boolean;
  canUnlockReview: boolean;
  // Customer details from review
  customerName?: string;
  customerAddress?: string;
  customerCity?: string;
  customerZipcode?: string;
  customerPhone?: string;
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
  matchType,
  matchReasons,
  matchScore,
  detailedMatches,
  isNewReview,
  hideMatchScore,
  canUnlockReview,
  customerName,
  customerAddress,
  customerCity,
  customerZipcode,
  customerPhone,
}) => {
  const [showResponseForm, setShowResponseForm] = useState(false);

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
          <p className="text-gray-700 leading-relaxed md:text-base text-sm">{content}</p>
        ) : (
          <div className="space-y-4">
            <div className="relative inline-block w-full">
              {/* Clear first 3 characters */}
              <span className="text-gray-700 leading-relaxed md:text-base text-sm">
                {content.substring(0, 3)}
              </span>
              {/* Blurred remaining text */}
              <span
                className="text-gray-700 leading-relaxed md:text-base text-sm"
                style={{
                  filter: 'blur(8px)',
                  WebkitFilter: 'blur(8px)',
                }}
              >
                {content.substring(3)}
              </span>
            </div>
            
            {/* Match Information - show for unlockable reviews */}
            {canUnlockReview && (
              <ReviewMatchInfo
                matchType={matchType}
                matchReasons={matchReasons}
                matchScore={matchScore}
                detailedMatches={detailedMatches}
                isNewReview={isNewReview}
                isClaimingReview={isClaimingReview}
                onClaimClick={onClaimClick}
                isReviewClaimed={isReviewClaimed}
                hideMatchScore={hideMatchScore}
              />
            )}
            
            {/* Access Options Card - only show if user can unlock this review */}
            {canUnlockReview && (
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
                          className="w-full flex items-center justify-center gap-2 text-xs sm:text-sm px-3 py-2"
                        >
                          <CreditCard className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="truncate">Unlock with 1 Credit</span>
                        </Button>
                      ) : (
                        <Button
                          onClick={onPurchaseClick}
                          variant="outline"
                          className="w-full flex items-center justify-center gap-2 text-xs sm:text-sm px-3 py-2"
                        >
                          <CreditCard className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="truncate">Unlock Review ($3)</span>
                        </Button>
                      )}
                      
                      {/* Subscription Option */}
                      <Button
                        onClick={onSubscribeClick}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm px-3 py-2"
                      >
                        <Crown className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="truncate">Subscribe Now</span>
                      </Button>
                    </div>
                </CardContent>
              </Card>
            )}
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
