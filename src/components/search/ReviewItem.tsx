
import { useAuth } from "@/contexts/auth";
import PhotoGallery from "@/components/reviews/PhotoGallery";
import CustomerReviewResponse from "@/components/customer/CustomerReviewResponse";
import ReviewItemHeader from "./ReviewItemHeader";
import ReviewItemContent from "./ReviewItemContent";
import ReviewItemActions from "./ReviewItemActions";
import { useReviewData } from "@/hooks/useReviewData";
import { useCustomerReviewResponses } from "@/hooks/useCustomerReviewResponses";
import VerifiedBadge from "@/components/ui/VerifiedBadge";

interface ReviewItemProps {
  review: {
    id: string;
    reviewerId: string;
    reviewerName: string;
    rating: number;
    content: string;
    date: string;
    reviewerVerified?: boolean;
  };
  hasFullAccess: boolean;
  onEdit?: (reviewId: string) => void;
  onDelete?: (reviewId: string) => void;
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

const ReviewItem = ({ review, hasFullAccess, onEdit, onDelete, customerData }: ReviewItemProps) => {
  const { currentUser, isSubscribed } = useAuth();
  const isBusinessUser = currentUser?.type === "business" || currentUser?.type === "admin";
  const { photos, fullReviewContent } = useReviewData(review.id, hasFullAccess);
  const { responses } = useCustomerReviewResponses(review.id);

  // Check if current user is the business who wrote this review
  const isReviewAuthor = currentUser?.id === review.reviewerId;

  console.log(`ReviewItem: Business ${review.reviewerName} verification status: ${review.reviewerVerified}`);
  console.log(`ReviewItem: Review data passed to header:`, {
    reviewerName: review.reviewerName,
    reviewerId: review.reviewerId,
    reviewerVerified: review.reviewerVerified
  });
  console.log(`ReviewItem: Found ${responses.length} responses for review ${review.id}`);
  console.log(`ReviewItem: Current user ${currentUser?.id} is review author: ${isReviewAuthor}`);

  return (
    <div className="border-b border-gray-100 pb-4 last:border-b-0 relative">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <ReviewItemHeader 
            review={review} 
            hasFullAccess={hasFullAccess} 
          />
        </div>
        
        {/* Verified badge on the far right */}
        {review.reviewerVerified && (
          <div className="ml-4 flex-shrink-0">
            <VerifiedBadge size="md" />
          </div>
        )}
      </div>
      
      <ReviewItemContent
        review={review}
        fullReviewContent={fullReviewContent}
        hasFullAccess={hasFullAccess}
        customerData={customerData}
      />

      {/* Photo Gallery - only show if user has full access */}
      <PhotoGallery 
        photos={photos} 
        hasAccess={hasFullAccess}
      />

      {/* Show responses if user has full access */}
      {hasFullAccess && (
        <CustomerReviewResponse
          reviewId={review.id}
          responses={responses}
          hasSubscription={isSubscribed}
          isOneTimeUnlocked={false}
          hideReplyOption={isReviewAuthor}
        />
      )}

      {/* Edit and Delete buttons for current user's reviews */}
      <ReviewItemActions
        review={review}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
};

export default ReviewItem;
