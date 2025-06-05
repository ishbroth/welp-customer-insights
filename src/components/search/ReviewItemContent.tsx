
import { useAuth } from "@/contexts/auth";

interface ReviewItemContentProps {
  review: {
    id: string;
    content: string;
    customer_name?: string;
    customer_phone?: string;
    customer_address?: string;
    customer_city?: string;
    customer_zipcode?: string;
  };
  fullReviewContent: string;
  hasFullAccess: boolean;
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

const ReviewItemContent = ({ 
  review, 
  fullReviewContent, 
  hasFullAccess,
  customerData 
}: ReviewItemContentProps) => {
  const { isSubscribed } = useAuth();

  return (
    <div className="mb-4">
      {/* Review Content */}
      <div className="mb-3">
        <p className="text-gray-700 leading-relaxed">
          {hasFullAccess ? fullReviewContent : review.content}
        </p>
      </div>
    </div>
  );
};

export default ReviewItemContent;
