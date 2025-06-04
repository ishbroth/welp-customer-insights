
import ReviewItem from "./ReviewItem";

interface ReviewsListProps {
  reviews: Array<{
    id: string;
    reviewerId: string;
    reviewerName: string;
    rating: number;
    content: string;
    date: string;
    reviewerVerified?: boolean;
  }>;
  hasFullAccess: (customerId: string) => boolean;
  customerData?: {
    firstName: string;
    lastName: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  onReviewUpdate?: () => void;
}

const ReviewsList = ({ reviews, hasFullAccess, customerData, onReviewUpdate }: ReviewsListProps) => {
  const customerId = "default-customer-id"; // This should be the actual customer ID

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900 mb-3">Reviews ({reviews.length})</h4>
      {reviews.map((review) => (
        <ReviewItem
          key={review.id}
          review={review}
          hasFullAccess={hasFullAccess(customerId)}
          customerData={customerData}
          onReviewUpdate={onReviewUpdate}
        />
      ))}
    </div>
  );
};

export default ReviewsList;
