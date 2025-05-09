
import { useAuth } from "@/contexts/AuthContext";
import ReviewItem from "./ReviewItem";

interface ReviewsListProps {
  customerId: string;
  reviews: any[];
  hasFullAccess: (customerId: string) => boolean;
}

const ReviewsList = ({ customerId, reviews, hasFullAccess }: ReviewsListProps) => {
  const { currentUser } = useAuth();
  
  // Non-logged in users and customers who haven't subscribed only see truncated reviews
  const shouldShowLimitedReview = !currentUser || (currentUser?.type === "customer" && !hasFullAccess(customerId));

  return (
    <div className="mt-4 space-y-4">
      {reviews?.length > 0 ? (
        reviews.map((review: any) => (
          <ReviewItem 
            key={review.id}
            review={review}
            customerId={customerId}
            hasFullAccess={hasFullAccess}
            shouldShowLimitedReview={shouldShowLimitedReview}
          />
        ))
      ) : (
        <div className="text-center py-4 text-gray-500">No reviews available</div>
      )}
    </div>
  );
};

export default ReviewsList;
