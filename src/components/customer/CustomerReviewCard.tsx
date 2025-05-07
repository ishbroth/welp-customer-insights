
import React from "react";
import { Eye, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Review } from "@/data/mockUsers";
import ReviewReactions from "@/components/ReviewReactions";
import CustomerReviewResponse from "@/components/customer/CustomerReviewResponse";

interface CustomerReviewCardProps {
  review: Review;
  isUnlocked: boolean;
  hasSubscription: boolean;
  onPurchaseReview: (reviewId: string) => void;
  onReactionToggle: (reviewId: string, reactionType: string) => void;
}

// Helper function to extract the first three words of a text
const getFirstThreeWords = (text: string): string => {
  const words = text.split(' ');
  const firstThree = words.slice(0, 3).join(' ');
  return `${firstThree}${words.length > 3 ? '...' : ''}`;
};

const CustomerReviewCard: React.FC<CustomerReviewCardProps> = ({
  review,
  isUnlocked,
  hasSubscription,
  onPurchaseReview,
  onReactionToggle,
}) => {
  const handlePurchaseClick = () => {
    onPurchaseReview(review.id);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border mb-4">
      <div className="flex justify-between mb-4">
        <div>
          <h3 className="font-semibold">{review.reviewerName}</h3>
          <p className="text-sm text-gray-500">
            {new Date(review.date).toLocaleDateString()}
          </p>
        </div>
      </div>

      {isUnlocked ? (
        <div>
          <p className="text-gray-700">{review.content}</p>
          <div className="mt-2 text-sm text-green-600 flex items-center">
            <Eye className="h-4 w-4 mr-1" />
            Full review unlocked
          </div>
          
          {/* Reactions for unlocked reviews */}
          <div className="mt-4 border-t pt-3">
            <div className="text-sm text-gray-500 mb-1">React to this review:</div>
            <ReviewReactions 
              reviewId={review.id}
              customerId={review.reviewerId} // Changed from review.customerId to review.reviewerId
              reactions={review.reactions || { like: [], funny: [], useful: [], ohNo: [] }}
              onReactionToggle={onReactionToggle}
            />
          </div>
          
          {/* Customer review responses component */}
          <CustomerReviewResponse 
            reviewId={review.id}
            responses={review.responses || []}
            hasSubscription={hasSubscription}
            isOneTimeUnlocked={isUnlocked && !hasSubscription}
            hideReplyOption={!hasSubscription} // Hide reply option if no subscription
          />
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
        </div>
      )}
    </div>
  );
};

export default CustomerReviewCard;
