
import ReviewsList from "./ReviewsList";
import CustomerInfo from "./CustomerInfo";
import { useAuth } from "@/contexts/auth";
import { useNavigate } from "react-router-dom";

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
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const isBusinessUser = currentUser?.type === "business" || currentUser?.type === "admin";
  
  const handleViewProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isBusinessUser && hasFullAccess(customer.id)) {
      navigate(`/customer/${customer.id}`);
    }
  };

  return (
    <div className="space-y-4">
      <CustomerInfo 
        customer={customer}
        isBusinessUser={isBusinessUser}
        isReviewCustomer={isReviewCustomer}
        onViewProfile={handleViewProfile}
        hasAccess={hasFullAccess(customer.id)}
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
