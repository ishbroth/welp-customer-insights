
import { useState } from "react";
import { Button } from "./ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ThumbsUp, Laugh, Award, Frown } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const userId = currentUser?.id || "";

  // Check if user has already reacted with each reaction type
  const hasLiked = reactions.like.includes(userId);
  const hasFunny = reactions.funny.includes(userId);
  const hasUseful = reactions.useful.includes(userId);
  const hasOhNo = reactions.ohNo.includes(userId);

  const handleReaction = (reactionType: string) => {
    // Don't allow reactions if not logged in
    if (!currentUser) {
      toast({
        title: "Login required",
        description: "Please login to react to reviews",
        variant: "destructive"
      });
      return;
    }

    // Check if user is allowed to react to this review
    const isCustomerBeingReviewed = currentUser.id === customerId;
    const isBusinessUser = currentUser.type === "business";
    
    if (!isCustomerBeingReviewed && !isBusinessUser) {
      toast({
        title: "Not allowed",
        description: "Only the reviewed customer or other businesses can react to reviews",
        variant: "destructive"
      });
      return;
    }

    onReactionToggle(reviewId, reactionType);
  };

  return (
    <div className="flex items-center gap-3 my-2">
      <Button 
        variant="outline" 
        size="sm" 
        className={cn(
          "flex items-center gap-1", 
          hasLiked ? "bg-blue-50 border-blue-200" : ""
        )}
        onClick={() => handleReaction("like")}
      >
        <ThumbsUp className={cn("h-4 w-4", hasLiked ? "text-blue-500" : "text-gray-500")} />
        <span className="text-xs">{reactions.like.length > 0 ? reactions.like.length : ""}</span>
      </Button>

      <Button 
        variant="outline" 
        size="sm" 
        className={cn(
          "flex items-center gap-1", 
          hasFunny ? "bg-yellow-50 border-yellow-200" : ""
        )}
        onClick={() => handleReaction("funny")}
      >
        <Laugh className={cn("h-4 w-4", hasFunny ? "text-yellow-500" : "text-gray-500")} />
        <span className="text-xs">{reactions.funny.length > 0 ? reactions.funny.length : ""}</span>
      </Button>

      <Button 
        variant="outline" 
        size="sm" 
        className={cn(
          "flex items-center gap-1", 
          hasUseful ? "bg-green-50 border-green-200" : ""
        )}
        onClick={() => handleReaction("useful")}
      >
        <Award className={cn("h-4 w-4", hasUseful ? "text-green-500" : "text-gray-500")} />
        <span className="text-xs">{reactions.useful.length > 0 ? reactions.useful.length : ""}</span>
      </Button>

      <Button 
        variant="outline" 
        size="sm" 
        className={cn(
          "flex items-center gap-1", 
          hasOhNo ? "bg-red-50 border-red-200" : ""
        )}
        onClick={() => handleReaction("ohNo")}
      >
        <Frown className={cn("h-4 w-4", hasOhNo ? "text-red-500" : "text-gray-500")} />
        <span className="text-xs">{reactions.ohNo.length > 0 ? reactions.ohNo.length : ""}</span>
      </Button>
    </div>
  );
};

export default ReviewReactions;
