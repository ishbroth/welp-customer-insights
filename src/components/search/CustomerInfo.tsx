
import { Badge } from "@/components/ui/badge";
import StarRating from "@/components/StarRating";
import { formatPhoneNumber } from "@/utils/phoneFormatter";

interface CustomerInfoProps {
  customer: {
    firstName: string;
    lastName: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    totalReviews?: number;
    averageRating?: number;
    id: string;
  };
  isBusinessUser: boolean;
  isReviewCustomer: boolean;
  onViewProfile: (e: React.MouseEvent) => void;
  hasAccess?: boolean;
}

const CustomerInfo = ({ 
  customer, 
  isBusinessUser, 
  isReviewCustomer, 
  onViewProfile,
  hasAccess = false
}: CustomerInfoProps) => {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center">
        {isBusinessUser && !isReviewCustomer ? (
          <h3 
            className="font-medium text-lg text-primary hover:underline cursor-pointer"
            onClick={onViewProfile}
          >
            {customer.firstName} {customer.lastName}
          </h3>
        ) : (
          <h3 className="font-medium text-lg">
            {customer.firstName} {customer.lastName}
          </h3>
        )}
        
        {customer.totalReviews && customer.totalReviews > 0 && (
          <Badge variant="outline" className="ml-2">
            {customer.totalReviews} {customer.totalReviews === 1 ? 'review' : 'reviews'}
          </Badge>
        )}
      </div>
      
      <div className="flex items-center mt-1">
        {customer.averageRating && customer.averageRating > 0 && (
          <div className="flex items-center">
            <StarRating 
              rating={customer.averageRating} 
              grayedOut={!hasAccess}
            />
            <span className={`ml-2 text-sm ${!hasAccess ? 'text-gray-400' : 'text-gray-500'}`}>
              {customer.averageRating.toFixed(1)}
            </span>
          </div>
        )}
      </div>
      
      <div className="mt-2 text-sm text-gray-600">
        {customer.address && (
          <p>{customer.address}</p>
        )}
        {(customer.city || customer.state || customer.zipCode) && (
          <p>
            {customer.city}{customer.city && customer.state ? ', ' : ''}{customer.state} {customer.zipCode}
          </p>
        )}
        {customer.phone && (
          <p className="mt-1">Phone: {formatPhoneNumber(customer.phone)}</p>
        )}
      </div>
    </div>
  );
};

export default CustomerInfo;
