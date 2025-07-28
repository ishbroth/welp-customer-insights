
import React from "react";
import { ThumbsUp, Laugh, Frown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReviewReactionsProps {
  reactions: {
    like: string[];
    funny: string[];
    ohNo: string[];
  };
  onReactionToggle: (reactionType: string) => void;
}

const ReviewReactions: React.FC<ReviewReactionsProps> = ({
  reactions,
  onReactionToggle,
}) => {
  return (
    <div className="flex items-center gap-2 mt-3">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onReactionToggle("like")}
        className="flex items-center gap-1"
      >
        <ThumbsUp className="h-4 w-4" />
        <span>{reactions.like.length}</span>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onReactionToggle("funny")}
        className="flex items-center gap-1"
      >
        <Laugh className="h-4 w-4" />
        <span>{reactions.funny.length}</span>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onReactionToggle("ohNo")}
        className="flex items-center gap-1"
      >
        <Frown className="h-4 w-4" />
        <span>{reactions.ohNo.length}</span>
      </Button>
    </div>
  );
};

export default ReviewReactions;
