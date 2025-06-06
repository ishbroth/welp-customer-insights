
import ReviewsList from "./ReviewsList";

interface ExpandedCustomerViewProps {
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    reviews?: Array<{
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
    }>;
  };
  reviews: Array<{
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
  }>;
  hasFullAccess: (customerId: string) => boolean;
  isReviewCustomer?: boolean;
  onReviewUpdate?: () => void;
}

const ExpandedCustomerView = ({ 
  customer, 
  reviews, 
  hasFullAccess, 
  isReviewCustomer = false, 
  onReviewUpdate 
}: ExpandedCustomerViewProps) => {
  return (
    <ReviewsList
      reviews={reviews}
      hasFullAccess={hasFullAccess}
      customerData={customer}
      onReviewUpdate={onReviewUpdate}
    />
  );
};

export default ExpandedCustomerView;
