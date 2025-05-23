
import { useState } from "react";
import { ThumbsUp, Laugh, Award, Frown } from "lucide-react";
import ReactionButton from "./reactions/ReactionButton";
import { useReactionPermissions } from "./reactions/useReactionPermissions";

interface ReviewReactionsProps {
  reviewId: string;
  customerId: string;
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
  reactions, 
  onReactionToggle 
}: ReviewReactionsProps) => {
  const { useAuth } = require("@/contexts/auth");
  const { currentUser } = useAuth();
  const userId = currentUser?.id || "";
  const { checkPermissions } = useReactionPermissions({ customerId });

  // Check if user has already reacted with each reaction type
  const hasLiked = reactions.like.includes(userId);
  const hasFunny = reactions.funny.includes(userId);
  const hasUseful = reactions.useful.includes(userId);
  const hasOhNo = reactions.ohNo.includes(userId);

  const handleReaction = (reactionType: string) => {
    if (checkPermissions()) {
      onReactionToggle(reviewId, reactionType);
    }
  };

  return (
    <div className="flex items-center gap-3 my-2">
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
  );
};

export default ReviewReactions;
