
import { useState } from "react";
import { ThumbsUp, Laugh, Award, Frown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import ReactionButton from "./reactions/ReactionButton";
import { useAuth } from "@/contexts/auth";

interface ReviewReactionsProps {
  reviewId: string;
  customerId: string;
  businessId?: string;
  businessName?: string;
  businessAvatar?: string;
  reactions: {
    like: string[];
    funny: string[];
    useful: string[];
    ohNo: string[];
  };
  onReactionToggle: (reviewId: string, reactionType: string) => void;
}

const ReviewReactions = ({ 
  reviewId, 
  customerId,
  businessId,
  businessName,
  businessAvatar,
  reactions, 
  onReactionToggle 
}: ReviewReactionsProps) => {
  const { currentUser, hasOneTimeAccess, isSubscribed } = useAuth();
  const userId = currentUser?.id || "";
  const isCustomerUser = currentUser?.type === "customer";
  
  // Check if user has access to see business profile details
  const hasAccess = isSubscribed || hasOneTimeAccess(reviewId);
  
  // Check if user has already reacted with each reaction type
  const hasLiked = reactions.like.includes(userId);
  const hasFunny = reactions.funny.includes(userId);
  const hasUseful = reactions.useful.includes(userId);
  const hasOhNo = reactions.ohNo.includes(userId);

  const checkPermissions = () => {
    // Don't allow reactions if not logged in
    if (!currentUser) {
      return false;
    }

    // Check if user is allowed to react to this review
    const isCustomerBeingReviewed = currentUser.id === customerId;
    const isBusinessUser = currentUser.type === "business";
    
    // Allow if user is the customer being reviewed OR if they're a business user
    return isCustomerBeingReviewed || isBusinessUser;
  };

  const handleReaction = (reactionType: string) => {
    if (checkPermissions()) {
      onReactionToggle(reviewId, reactionType);
    }
  };

  // Get the business initials for the avatar fallback
  const getBusinessInitials = () => {
    if (!businessName) return "B";
    return businessName.split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="flex flex-col gap-3 my-2">
      {/* Business Avatar - Only shown for customer users with access */}
      {isCustomerUser && businessId && (businessAvatar || businessName) && (
        <div className="flex items-center mb-2">
          {hasAccess ? (
            <Link to={`/business/${businessId}`} className="flex items-center">
              <Avatar className="h-8 w-8 mr-2">
                {businessAvatar ? (
                  <AvatarImage src={businessAvatar} alt={businessName || "Business"} />
                ) : (
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {getBusinessInitials()}
                  </AvatarFallback>
                )}
              </Avatar>
              <span className="text-sm font-medium hover:underline">
                {businessName || "Business"}
              </span>
            </Link>
          ) : (
            <div className="flex items-center opacity-70">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarFallback className="bg-gray-200 text-gray-500 text-xs">
                  {getBusinessInitials()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">
                {businessName || "Business"}
              </span>
            </div>
          )}
        </div>
      )}
      
      {/* Reactions buttons */}
      <div className="flex items-center gap-3">
        <ReactionButton
          active={hasLiked}
          count={reactions.like.length}
          icon={ThumbsUp}
          activeColor="text-blue-500"
          activeBg="bg-blue-50"
          activeBorder="border-blue-200"
          onClick={() => handleReaction("like")}
        />

        <ReactionButton
          active={hasFunny}
          count={reactions.funny.length}
          icon={Laugh}
          activeColor="text-yellow-500"
          activeBg="bg-yellow-50"
          activeBorder="border-yellow-200"
          onClick={() => handleReaction("funny")}
        />

        <ReactionButton
          active={hasUseful}
          count={reactions.useful.length}
          icon={Award}
          activeColor="text-green-500"
          activeBg="bg-green-50"
          activeBorder="border-green-200"
          onClick={() => handleReaction("useful")}
        />

        <ReactionButton
          active={hasOhNo}
          count={reactions.ohNo.length}
          icon={Frown}
          activeColor="text-red-500"
          activeBg="bg-red-50"
          activeBorder="border-red-200"
          onClick={() => handleReaction("ohNo")}
        />
      </div>
    </div>
  );
};

export default ReviewReactions;
