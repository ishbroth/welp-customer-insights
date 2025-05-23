
import { useAuth } from "@/contexts/auth";
import ReviewItem from "./ReviewItem";
import { useReviewsFetching } from "@/hooks/useReviewsFetching";
import NoReviews from "./NoReviews";

interface ReviewsListProps {
  customerId: string;
  reviews: any[];
  hasFullAccess: (customerId: string) => boolean;
  isReviewCustomer?: boolean;
  customerProfile?: any;
}

const ReviewsList = ({ 
  customerId, 
  reviews, 
  hasFullAccess, 
  isReviewCustomer = false,
  customerProfile
}: ReviewsListProps) => {
  const { currentUser } = useAuth();
  const { processedReviews } = useReviewsFetching(customerId, reviews, isReviewCustomer);
  
  // Non-logged in users and customers who haven't subscribed only see truncated reviews
  const shouldShowLimitedReview = !currentUser || (currentUser?.type === "customer" && !hasFullAccess(customerId));

  if (processedReviews?.length === 0) {
    return customerProfile ? <NoReviews customerProfile={customerProfile} /> : (
      <div className="text-center py-4 text-gray-500">No reviews available</div>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      {processedReviews.map((review: any) => (
        <ReviewItem 
          key={review.id}
          review={review}
          customerId={customerId}
          hasFullAccess={hasFullAccess}
          shouldShowLimitedReview={shouldShowLimitedReview}
        />
      ))}
    </div>
  );
};

export default ReviewsList;
