
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import StarRating from "@/components/StarRating";
import CustomerCardAvatar from "./CustomerCardAvatar";

interface Review {
  id: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar?: string;
  rating: number;
  content: string;
  date: string;
  reviewerVerified?: boolean;
}

interface CustomerCardReviewItemProps {
  review: Review;
  customerName: string;
  customerAvatar?: string;
  getInitials: (name: string) => string;
}

const CustomerCardReviewItem = ({
  review,
  customerName,
  customerAvatar,
  getInitials
}: CustomerCardReviewItemProps) => {
  return (
    <div className="border-l-4 border-blue-200 pl-4 py-2">
      {/* Review header with business on left, customer on right */}
      <div className="flex items-start justify-between mb-2">
        {/* Business info - left side (larger) */}
        <div className="flex items-center space-x-3">
          <CustomerCardAvatar
            src={review.reviewerAvatar}
            alt={review.reviewerName}
            fallbackText={getInitials(review.reviewerName)}
            size="md"
            className="bg-green-100 text-green-800"
          />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold">{review.reviewerName}</h4>
              {review.reviewerVerified && <VerifiedBadge size="sm" />}
            </div>
            <p className="text-xs text-gray-500">Business</p>
          </div>
        </div>

        {/* Customer info - right side (smaller) */}
        <div className="flex items-center space-x-2">
          <CustomerCardAvatar
            src={customerAvatar}
            alt={customerName}
            fallbackText={getInitials(customerName)}
            size="sm"
            className="bg-gray-100 text-gray-600"
          />
          <div>
            <p className="text-xs font-medium">{customerName}</p>
            <p className="text-xs text-gray-500">Customer</p>
          </div>
        </div>
      </div>
      
      <div className="mb-2">
        <StarRating rating={review.rating} size="sm" />
        <span className="ml-2 text-xs text-gray-500">
          {new Date(review.date).toLocaleDateString()}
        </span>
      </div>
      <p className="text-sm text-gray-700">{review.content}</p>
    </div>
  );
};

export default CustomerCardReviewItem;
