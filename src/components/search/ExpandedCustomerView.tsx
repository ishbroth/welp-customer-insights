
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth";
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
  };
  reviews: any[];
  hasFullAccess: (customerId: string) => boolean;
  isReviewCustomer: boolean;
}

const ExpandedCustomerView = ({ 
  customer, 
  reviews, 
  hasFullAccess, 
  isReviewCustomer 
}: ExpandedCustomerViewProps) => {
  const { currentUser } = useAuth();
  const isBusinessUser = currentUser?.type === "business" || currentUser?.type === "admin";

  const customerData = {
    firstName: customer.firstName,
    lastName: customer.lastName,
    phone: customer.phone || "",
    address: customer.address || "",
    city: customer.city || "",
    state: customer.state || "",
    zipCode: customer.zipCode || ""
  };

  const hasCurrentUserReviewed = () => {
    if (!currentUser || !isBusinessUser) return false;
    return reviews.some(review => review.reviewerId === currentUser.id);
  };

  return (
    <div className="mt-4 border-t pt-3">
      <ReviewsList 
        customerId={customer.id} 
        reviews={reviews}
        hasFullAccess={hasFullAccess}
        isReviewCustomer={isReviewCustomer}
        customerData={customerData}
      />

      {isBusinessUser && !hasCurrentUserReviewed() && (
        <div className="mt-4">
          <Link
            to={`/review/new?firstName=${encodeURIComponent(customer.firstName)}&lastName=${encodeURIComponent(customer.lastName)}&phone=${encodeURIComponent(customer.phone || '')}&address=${encodeURIComponent(customer.address || '')}&city=${encodeURIComponent(customer.city || '')}&zipCode=${encodeURIComponent(customer.zipCode || '')}`}
            className="w-full"
          >
            <Button variant="secondary" className="w-full">
              Write a Review for this Customer
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default ExpandedCustomerView;
