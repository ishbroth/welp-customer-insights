
import ExpandedCustomerView from "./ExpandedCustomerView";
import NoReviews from "./NoReviews";

interface CustomerCardExpandedContentProps {
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
  sortedReviews: Array<{
    id: string;
    reviewerId: string;
    reviewerName: string;
    rating: number;
    content: string;
    date: string;
    reviewerVerified?: boolean;
  }>;
  hasFullAccessFunction: (customerId: string) => boolean;
  isReviewCustomer: boolean;
  onReviewUpdate?: () => void;
}

const CustomerCardExpandedContent = ({
  customer,
  sortedReviews,
  hasFullAccessFunction,
  isReviewCustomer,
  onReviewUpdate
}: CustomerCardExpandedContentProps) => {
  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      {sortedReviews && sortedReviews.length > 0 ? (
        <ExpandedCustomerView 
          customer={customer}
          reviews={sortedReviews}
          hasFullAccess={hasFullAccessFunction}
          isReviewCustomer={isReviewCustomer}
          onReviewUpdate={onReviewUpdate}
        />
      ) : (
        <NoReviews 
          customerProfile={{
            first_name: customer.firstName,
            last_name: customer.lastName,
            phone: customer.phone,
            address: customer.address,
            city: customer.city,
            zipcode: customer.zipCode
          }}
        />
      )}
    </div>
  );
};

export default CustomerCardExpandedContent;
