
import ReviewsList from "./ReviewsList";
import CustomerInfo from "./CustomerInfo";

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
  }>;
  hasFullAccess: (customerId: string) => boolean;
  isReviewCustomer: boolean;
  onReviewUpdate?: () => void;
}

const ExpandedCustomerView = ({ 
  customer, 
  reviews, 
  hasFullAccess, 
  isReviewCustomer,
  onReviewUpdate 
}: ExpandedCustomerViewProps) => {
  return (
    <div className="space-y-4">
      <CustomerInfo 
        customer={customer}
        isReviewCustomer={isReviewCustomer}
      />
      
      <ReviewsList 
        reviews={reviews}
        hasFullAccess={hasFullAccess}
        customerData={{
          id: customer.id,
          firstName: customer.firstName,
          lastName: customer.lastName,
          phone: customer.phone,
          address: customer.address,
          city: customer.city,
          state: customer.state,
          zipCode: customer.zipCode
        }}
        onReviewUpdate={onReviewUpdate}
      />
    </div>
  );
};

export default ExpandedCustomerView;
