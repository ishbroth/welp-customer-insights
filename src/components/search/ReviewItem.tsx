
import { useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth";
import StarRating from "@/components/StarRating";
import { Badge } from "@/components/ui/badge";

interface ReviewItemProps {
  review: {
    id: string;
    reviewerId: string;
    reviewerName: string;
    rating: number;
    content: string;
    date: string;
  };
  hasFullAccess: boolean;
  onEdit?: (reviewId: string) => void;
  onDelete?: (reviewId: string) => void;
}

const ReviewItem = ({ review, hasFullAccess, onEdit, onDelete }: ReviewItemProps) => {
  const { currentUser } = useAuth();
  const isCurrentUserReview = currentUser?.id === review.reviewerId;
  const isBusinessUser = currentUser?.type === "business" || currentUser?.type === "admin";

  const getFirstThreeWords = (text: string): string => {
    const words = text.split(' ');
    const firstThree = words.slice(0, 3).join(' ');
    return `${firstThree}${words.length > 3 ? '...' : ''}`;
  };

  return (
    <div className="border-b border-gray-100 pb-4 last:border-b-0">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-medium">{review.reviewerName}</h4>
          <div className="flex items-center mt-1">
            <StarRating rating={review.rating} />
            <span className="ml-2 text-sm text-gray-500">
              {review.rating}.0
            </span>
          </div>
        </div>
        <span className="text-sm text-gray-500">
          {new Date(review.date).toLocaleDateString()}
        </span>
      </div>
      
      <div className="mt-2">
        {hasFullAccess ? (
          <div>
            <p className="text-gray-700">{review.content}</p>
            <Badge variant="outline" className="mt-2 text-xs">
              Full access
            </Badge>
          </div>
        ) : (
          <div>
            <p className="text-gray-700">{getFirstThreeWords(review.content)}</p>
            <Badge variant="secondary" className="mt-2 text-xs">
              Limited access
            </Badge>
          </div>
        )}
      </div>

      {/* Edit and Delete buttons for current user's reviews */}
      {isCurrentUserReview && isBusinessUser && (
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
      )}
    </div>
  );
};

export default ReviewItem;
