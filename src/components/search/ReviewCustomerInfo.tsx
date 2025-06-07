
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ReviewCustomerInfoProps {
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
  review: {
    customer_name?: string;
    customer_phone?: string;
    customer_address?: string;
    customer_city?: string;
    customer_zipcode?: string;
  };
  finalCustomerAvatar: string;
}

const ReviewCustomerInfo = ({ 
  hasFullAccess, 
  customerData, 
  review, 
  finalCustomerAvatar 
}: ReviewCustomerInfoProps) => {
  if (!hasFullAccess || (!customerData && !review.customer_name)) {
    return null;
  }

  return (
    <div className="mt-3 p-3 bg-gray-50 rounded-md">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
        {customerData ? (
          <>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={finalCustomerAvatar} alt={`${customerData.firstName} ${customerData.lastName}`} />
                <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                  {customerData.firstName?.[0]}{customerData.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <span className="font-medium">Name:</span> {customerData.firstName} {customerData.lastName}
              </div>
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
  );
};

export default ReviewCustomerInfo;
