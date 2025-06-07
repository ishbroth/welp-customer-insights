
import { useAuth } from "@/contexts/auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import CustomerReviewResponse from "@/components/customer/CustomerReviewResponse";
import ReviewRating from "./ReviewRating";
import ReviewBusinessInfo from "./ReviewBusinessInfo";
import ReviewBusinessAvatar from "./ReviewBusinessAvatar";
import ReviewContent from "./ReviewContent";
import ReviewCustomerInfo from "./ReviewCustomerInfo";

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
  const { isSubscribed } = useAuth();

  // Fetch customer profile if we have customerId but no customer data
  const { data: customerProfile } = useQuery({
    queryKey: ['customerProfile', review.customerId],
    queryFn: async () => {
      if (!review.customerId) return null;
      
      console.log(`ReviewCard: Fetching customer profile for ID: ${review.customerId}`);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, avatar, first_name, last_name, name')
        .eq('id', review.customerId)
        .maybeSingle();

      if (error) {
        console.error("ReviewCard: Error fetching customer profile:", error);
        return null;
      }

      console.log(`ReviewCard: Customer profile found:`, data);
      return data;
    },
    enabled: !!review.customerId && !customerData?.avatar
  });

  // Get final customer avatar - prefer customerData, then fetched profile
  const finalCustomerAvatar = customerData?.avatar || customerProfile?.avatar || '';

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

      {/* Response section with proper conversation flow */}
      <CustomerReviewResponse 
        reviewId={review.id}
        responses={review.responses || []}
        hasSubscription={isSubscribed}
        isOneTimeUnlocked={hasFullAccess}
        reviewAuthorId={review.reviewerId}
      />
    </div>
  );
};

export default ReviewCard;
