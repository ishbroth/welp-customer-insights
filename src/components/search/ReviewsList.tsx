
import CustomerReviewCard from "@/components/customer/CustomerReviewCard";

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

  // Transform reviews to match CustomerReviewCard format
  const transformedReviews = reviews.map(review => ({
    id: review.id,
    reviewerId: review.reviewerId,
    reviewerName: review.reviewerName,
    reviewerAvatar: review.reviewerAvatar,
    rating: review.rating,
    content: review.content,
    date: review.date,
    customerId: review.customerId || customerId,
    customerName: review.customer_name || `${customerData?.firstName || ''} ${customerData?.lastName || ''}`.trim(),
    address: review.customer_address || customerData?.address,
    city: review.customer_city || customerData?.city,
    state: customerData?.state,
    zipCode: review.customer_zipcode || customerData?.zipCode,
    reviewerVerified: review.reviewerVerified,
    reactions: { like: [], funny: [], ohNo: [] },
    responses: []
  }));

  const handlePurchase = (reviewId: string) => {
    // Handle review purchase logic
    console.log('Purchase review:', reviewId);
  };

  const handleReactionToggle = (reviewId: string, reactionType: string) => {
    // Handle reaction toggle logic
    console.log('Toggle reaction:', reactionType, 'for review:', reviewId);
  };

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900 mb-3">Reviews ({reviews.length})</h4>
      {transformedReviews.map((review) => (
        <CustomerReviewCard
          key={review.id}
          review={review}
          isUnlocked={hasFullAccess(customerId)}
          hasSubscription={hasFullAccess(customerId)}
          onPurchase={handlePurchase}
          onReactionToggle={handleReactionToggle}
        />
      ))}
    </div>
  );
};

export default ReviewsList;
