
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
  const { currentUser, isSubscribed } = useAuth();
  const { processedReviews } = useReviewsFetching(customerId, reviews, isReviewCustomer);
  
  // Check if user is admin account with permanent subscription
  const isAdminAccount = currentUser?.id === "10000000-0000-0000-0000-000000000001" || 
                        currentUser?.id === "10000000-0000-0000-0000-000000000002";
  
  // Admin accounts and subscribed users should see full reviews
  const shouldShowLimitedReview = !currentUser || 
    (currentUser?.type === "customer" && !isSubscribed && !isAdminAccount && !hasFullAccess(customerId)) ||
    (currentUser?.type === "business" && !isSubscribed && !isAdminAccount);

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
