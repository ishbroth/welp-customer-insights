
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
  reviewerVerified?: boolean;
}

interface ReviewsListProps {
  customerId: string;
  reviews: Review[];
  hasFullAccess: (customerId: string) => boolean;
  isReviewCustomer: boolean;
  customerProfile?: any;
  customerData?: {
    firstName: string;
    lastName: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
}

const ReviewsList = ({ 
  customerId, 
  reviews, 
  hasFullAccess, 
  isReviewCustomer, 
  customerProfile,
  customerData 
}: ReviewsListProps) => {
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

  console.log("ReviewsList: Reviews with verification status:", reviews.map(r => ({
    name: r.reviewerName,
    verified: r.reviewerVerified
  })));

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
            customerData={customerData}
          />
        ))}
      </div>
    </div>
  );
};

export default ReviewsList;
