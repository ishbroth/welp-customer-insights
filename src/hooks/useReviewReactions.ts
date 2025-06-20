
import { useReactionPersistence } from "@/hooks/useReactionPersistence";

interface UseReviewReactionsProps {
  reviewId: string;
  initialReactions: { like: string[]; funny: string[]; ohNo: string[] };
  onReactionToggle: (reviewId: string, reactionType: string) => void;
}

export const useReviewReactions = ({
  reviewId,
  initialReactions,
  onReactionToggle,
}: UseReviewReactionsProps) => {
  const { reactions, toggleReaction } = useReactionPersistence(
    reviewId, 
    initialReactions
  );

  const handleReactionToggle = (reviewId: string, reactionType: string) => {
    toggleReaction(reactionType as keyof typeof reactions);
    onReactionToggle(reviewId, reactionType);
  };

  return {
    reactions,
    handleReactionToggle,
  };
};
