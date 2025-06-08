
import { useAuth } from "@/contexts/auth";
import CustomerReviewResponse from "@/components/customer/CustomerReviewResponse";
import ReviewRating from "./ReviewRating";
import ReviewBusinessInfo from "./ReviewBusinessInfo";
import ReviewBusinessAvatar from "./ReviewBusinessAvatar";
import ReviewContent from "./ReviewContent";
import ReviewCustomerInfo from "./ReviewCustomerInfo";
import { useCustomerProfileData } from "@/hooks/useCustomerProfileData";
import { useEnhancedResponses } from "@/hooks/useEnhancedResponses";

interface ReviewCardProps {
  review: {
    id: string;
    reviewerId: string;
    reviewerName: string;
    rating: number;
    content: string;
    date: string;
    reviewerVerified?: boolean;
    customer_name?: string;
    customer_phone?: string;
    customer_address?: string;
    customer_city?: string;
    customer_zipcode?: string;
    customerId?: string;
    responses?: Array<{
      id: string;
      authorId: string;
      authorName: string;
      content: string;
      createdAt: string;
    }>;
  };
  hasFullAccess: boolean;
  customerData?: {
    firstName: string;
    lastName: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    avatar?: string;
  };
}

const ReviewCard = ({ review, hasFullAccess, customerData }: ReviewCardProps) => {
  const { isSubscribed, currentUser } = useAuth();

  // Fetch customer profile if we have customerId but no customer data
  const { data: customerProfile } = useCustomerProfileData(
    review.customerId,
    !!customerData?.avatar
  );

  // Fetch enhanced responses with proper author names - only if user is logged in
  const { data: enhancedResponses } = useEnhancedResponses(
    review, 
    customerData,
    !!currentUser // Only fetch if user is logged in
  );

  // Get final customer avatar - prefer customerData, then fetched profile
  const finalCustomerAvatar = customerData?.avatar || customerProfile?.avatar || '';

  // Use enhanced responses if available and user is logged in, otherwise fall back to empty array
  const responsesToUse = currentUser && (enhancedResponses || review.responses || []) || [];

  console.log('ReviewCard: Final responses to display:', responsesToUse);

  return (
    <div className="border-b border-gray-100 pb-4 last:border-b-0">
      <div className="flex justify-between items-start">
        {/* Left side: Rating, Business name, Date */}
        <div className="flex flex-col space-y-2">
          <ReviewRating rating={review.rating} />
          <ReviewBusinessInfo 
            reviewerName={review.reviewerName}
            reviewerId={review.reviewerId}
            date={review.date}
            hasFullAccess={hasFullAccess}
          />
        </div>

        {/* Right side: Verified badge and Avatar */}
        <ReviewBusinessAvatar 
          reviewerId={review.reviewerId}
          reviewerName={review.reviewerName}
          reviewerVerified={review.reviewerVerified}
        />
      </div>

      <ReviewContent content={review.content} />

      <ReviewCustomerInfo 
        hasFullAccess={hasFullAccess}
        customerData={customerData}
        review={review}
        finalCustomerAvatar={finalCustomerAvatar}
      />

      {/* Response section - only show if user is logged in */}
      {currentUser && (
        <CustomerReviewResponse 
          reviewId={review.id}
          responses={responsesToUse}
          hasSubscription={isSubscribed}
          isOneTimeUnlocked={hasFullAccess}
          reviewAuthorId={review.reviewerId}
        />
      )}
    </div>
  );
};

export default ReviewCard;
