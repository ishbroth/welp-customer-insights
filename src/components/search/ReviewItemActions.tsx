
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface ReviewItemActionsProps {
  review: {
    id: string;
    reviewerId: string;
  };
  onEdit?: (reviewId: string) => void;
  onDelete?: (reviewId: string) => void;
}

const ReviewItemActions = ({ review, onEdit, onDelete }: ReviewItemActionsProps) => {
  const { currentUser } = useAuth();
  const isCurrentUserReview = currentUser?.id === review.reviewerId;
  const isBusinessUser = currentUser?.type === "business" || currentUser?.type === "admin";

  if (!isCurrentUserReview || !isBusinessUser) {
    return null;
  }

  return (
    <div className="flex justify-end gap-2 mt-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onEdit?.(review.id)}
        className="text-gray-600 hover:text-gray-800"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete?.(review.id)}
        className="text-red-600 hover:text-red-800"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ReviewItemActions;
