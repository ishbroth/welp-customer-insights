
import { Badge } from "@/components/ui/badge";

interface CustomerReviewBadgeProps {
  hasReviews: boolean;
  reviewCount: number;
}

const CustomerReviewBadge = ({ hasReviews, reviewCount }: CustomerReviewBadgeProps) => {
  if (hasReviews) {
    return (
      <Badge variant="secondary" className="text-xs">
        {reviewCount} review{reviewCount !== 1 ? 's' : ''}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="text-xs text-gray-500">
      No reviews
    </Badge>
  );
};

export default CustomerReviewBadge;
