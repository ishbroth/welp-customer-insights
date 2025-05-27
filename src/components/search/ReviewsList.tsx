
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import ReviewItem from "./ReviewItem";
import NoReviews from "./NoReviews";

interface Review {
  id: string;
  reviewerId: string;
  reviewerName: string;
  rating: number;
  content: string;
  date: string;
}

interface ReviewsListProps {
  customerId: string;
  reviews: Review[];
  hasFullAccess: (customerId: string) => boolean;
  isReviewCustomer: boolean;
  customerProfile?: any;
}

const ReviewsList = ({ customerId, reviews, hasFullAccess, isReviewCustomer, customerProfile }: ReviewsListProps) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const isBusinessUser = currentUser?.type === "business" || currentUser?.type === "admin";

  const handleEditReview = (reviewId: string) => {
    // Navigate to edit review page
    toast({
      title: "Edit Review",
      description: "Edit functionality will be implemented soon.",
    });
  };

  const handleDeleteReview = (reviewId: string) => {
    // Show delete confirmation
    toast({
      title: "Delete Review",
      description: "Delete functionality will be implemented soon.",
      variant: "destructive",
    });
  };

  if (reviews.length === 0) {
    return <NoReviews customerProfile={customerProfile} />;
  }

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900">
        Reviews ({reviews.length})
      </h4>
      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewItem
            key={review.id}
            review={review}
            hasFullAccess={hasFullAccess(customerId)}
            onEdit={handleEditReview}
            onDelete={handleDeleteReview}
          />
        ))}
      </div>
    </div>
  );
};

export default ReviewsList;
