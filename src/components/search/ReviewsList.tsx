
import ReviewCard from "./ReviewCard";

interface ReviewsListProps {
  reviews: Array<{
    id: string;
    reviewerId: string;
    reviewerName: string;
    rating: number;
    content: string;
    date: string;
    reviewerVerified?: boolean;
    reviewerAvatar?: string;
    customerAvatar?: string;
    customer_name?: string;
    customer_phone?: string;
    customer_address?: string;
    customer_city?: string;
    customer_zipcode?: string;
    customerId?: string;
  }>;
  hasFullAccess: (customerId: string) => boolean;
  customerData?: {
    id: string;
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
  const customerId = customerData?.id || "default-customer-id";

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900 mb-3">Reviews ({reviews.length})</h4>
      {reviews.map((review) => (
        <ReviewCard
          key={review.id}
          review={review}
          hasFullAccess={hasFullAccess(customerId)}
          customerData={customerData}
        />
      ))}
    </div>
  );
};

export default ReviewsList;
