
import React from "react";
import { Eye, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useNavigate } from "react-router-dom";
import { Review } from "@/types";
import ReviewReactions from "@/components/ReviewReactions";
import CustomerReviewResponse from "@/components/customer/CustomerReviewResponse";
import { useReactionPersistence } from "@/hooks/useReactionPersistence";
import { useAuth } from "@/contexts/auth";
import VerifiedBadge from "@/components/ui/VerifiedBadge";

interface CustomerReviewCardProps {
  review: Review;
  isUnlocked: boolean;
  hasSubscription: boolean;
  onPurchase: (reviewId: string) => void;
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
  onPurchase,
  onReactionToggle,
}) => {
  const { isSubscribed } = useAuth();
  const navigate = useNavigate();
  const { reactions, toggleReaction } = useReactionPersistence(
    review.id, 
    review.reactions || { like: [], funny: [], ohNo: [] }
  );

  const handlePurchaseClick = () => {
    onPurchase(review.id);
  };

  const getBusinessInitials = () => {
    if (review.reviewerName) {
      const names = review.reviewerName.split(' ');
      return names.map(name => name[0]).join('').toUpperCase().slice(0, 2);
    }
    return "B";
  };

  const handleReactionToggle = (reviewId: string, reactionType: string) => {
    console.log('Handling reaction toggle:', reactionType, 'for review:', reviewId);
    toggleReaction(reactionType as keyof typeof reactions);
    onReactionToggle(reviewId, reactionType);
  };

  const handleResponseSubmitted = (newResponse: any) => {
    // Handle response submission if needed
    console.log('Response submitted:', newResponse);
  };

  const handleBusinessNameClick = () => {
    // Only allow navigation if user is subscribed or has unlocked this review
    if (isSubscribed || isUnlocked) {
      navigate(`/business/${review.reviewerId}`);
    }
  };

  // Use the reviewerVerified property directly from the review
  const isVerified = review.reviewerVerified || false;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border mb-4">
      <div className="flex justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              {review.reviewerAvatar ? (
                <AvatarImage src={review.reviewerAvatar} alt={review.reviewerName} />
              ) : (
                <AvatarFallback className="bg-blue-100 text-blue-800">
                  {getBusinessInitials()}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                {(isSubscribed || isUnlocked) ? (
                  <h3 
                    className="font-semibold cursor-pointer text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                    onClick={handleBusinessNameClick}
                  >
                    {review.reviewerName}
                  </h3>
                ) : (
                  <h3 className="font-semibold">{review.reviewerName}</h3>
                )}
                {/* Show verified badge next to business name when customers see it */}
                {isVerified && <VerifiedBadge size="sm" />}
              </div>
              <p className="text-sm text-gray-500">
                {new Date(review.date).toLocaleDateString()}
              </p>
            </div>
          </div>
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
              customerId={review.customerId}
              businessId={review.reviewerId}
              businessName={review.reviewerName}
              businessAvatar={review.reviewerAvatar}
              reactions={reactions}
              onReactionToggle={handleReactionToggle}
            />
          </div>
          
          {/* Customer review responses component */}
          <CustomerReviewResponse 
            reviewId={review.id}
            responses={review.responses || []}
            hasSubscription={hasSubscription}
            isOneTimeUnlocked={isUnlocked && !hasSubscription}
            hideReplyOption={!hasSubscription && !isUnlocked}
            onResponseSubmitted={handleResponseSubmitted}
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
