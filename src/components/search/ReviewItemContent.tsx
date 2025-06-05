
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

      {/* Customer Information - Only show if user has full access */}
      {hasFullAccess && (customerData || review.customer_name) && (
        <div className="mt-3 p-3 bg-gray-50 rounded-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
            {customerData ? (
              <>
                <div>
                  <span className="font-medium">Name:</span> {customerData.firstName} {customerData.lastName}
                </div>
                {customerData.phone && (
                  <div>
                    <span className="font-medium">Phone:</span> {customerData.phone}
                  </div>
                )}
                {customerData.address && (
                  <div>
                    <span className="font-medium">Address:</span> {customerData.address}
                  </div>
                )}
                {customerData.city && customerData.state && (
                  <div>
                    <span className="font-medium">Location:</span> {customerData.city}, {customerData.state} {customerData.zipCode}
                  </div>
                )}
              </>
            ) : (
              <>
                {review.customer_name && (
                  <div>
                    <span className="font-medium">Name:</span> {review.customer_name}
                  </div>
                )}
                {review.customer_phone && (
                  <div>
                    <span className="font-medium">Phone:</span> {review.customer_phone}
                  </div>
                )}
                {review.customer_address && (
                  <div>
                    <span className="font-medium">Address:</span> {review.customer_address}
                  </div>
                )}
                {(review.customer_city || review.customer_zipcode) && (
                  <div>
                    <span className="font-medium">Location:</span> {review.customer_city} {review.customer_zipcode}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewItemContent;
