
import React, { useState } from "react";
import { Eye, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { Review } from "@/types";
import ReviewReactions from "@/components/ReviewReactions";
import CustomerReviewResponse from "@/components/customer/CustomerReviewResponse";
import { useAuth } from "@/contexts/auth";

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
  const [localReview, setLocalReview] = useState(review);
  const { currentUser } = useAuth();

  const handlePurchaseClick = () => {
    onPurchase(review.id);
  };

  const getBusinessInitials = () => {
    if (localReview.reviewerName) {
      const names = localReview.reviewerName.split(' ');
      return names.map(name => name[0]).join('').toUpperCase().slice(0, 2);
    }
    return "B";
  };

  const handleReactionToggle = (reviewId: string, reactionType: string) => {
    // Update local state to reflect the reaction change
    setLocalReview(prev => {
      const userId = currentUser?.id || '';
      const currentReactions = prev.reactions || { like: [], funny: [], ohNo: [] };
      const hasReacted = currentReactions[reactionType]?.includes(userId);
      
      const updatedReactions = {
        ...currentReactions,
        [reactionType]: hasReacted
          ? currentReactions[reactionType].filter(id => id !== userId)
          : [...(currentReactions[reactionType] || []), userId]
      };
      
      return { ...prev, reactions: updatedReactions };
    });
    
    // Call the parent's reaction toggle handler
    onReactionToggle(reviewId, reactionType);
  };

  const handleResponseSubmitted = (newResponse: any) => {
    // Update local review state to include the new response
    setLocalReview(prev => ({
      ...prev,
      responses: [...(prev.responses || []), newResponse]
    }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border mb-4">
      <div className="flex justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Link to={`/business/${localReview.reviewerId}`} className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <Avatar className="h-10 w-10">
              {localReview.reviewerAvatar ? (
                <AvatarImage src={localReview.reviewerAvatar} alt={localReview.reviewerName} />
              ) : (
                <AvatarFallback className="bg-blue-100 text-blue-800">
                  {getBusinessInitials()}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <h3 className="font-semibold hover:text-blue-600 transition-colors">{localReview.reviewerName}</h3>
              <p className="text-sm text-gray-500">
                {new Date(localReview.date).toLocaleDateString()}
              </p>
            </div>
          </Link>
        </div>
      </div>

      {isUnlocked ? (
        <div>
          <p className="text-gray-700">{localReview.content}</p>
          <div className="mt-2 text-sm text-green-600 flex items-center">
            <Eye className="h-4 w-4 mr-1" />
            Full review unlocked
          </div>
          
          {/* Reactions for unlocked reviews */}
          <div className="mt-4 border-t pt-3">
            <div className="text-sm text-gray-500 mb-1">React to this review:</div>
            <ReviewReactions 
              reviewId={localReview.id}
              customerId={localReview.customerId}
              businessId={localReview.reviewerId}
              businessName={localReview.reviewerName}
              businessAvatar={localReview.reviewerAvatar}
              reactions={localReview.reactions || { like: [], funny: [], ohNo: [] }}
              onReactionToggle={handleReactionToggle}
            />
          </div>
          
          {/* Customer review responses component */}
          <CustomerReviewResponse 
            reviewId={localReview.id}
            responses={localReview.responses || []}
            hasSubscription={hasSubscription}
            isOneTimeUnlocked={isUnlocked && !hasSubscription}
            hideReplyOption={!hasSubscription && !isUnlocked}
            onResponseSubmitted={handleResponseSubmitted}
          />
        </div>
      ) : (
        <div>
          <p className="text-gray-700">{getFirstThreeWords(localReview.content)}</p>
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
