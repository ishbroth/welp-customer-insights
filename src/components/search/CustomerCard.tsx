
import { useNavigate } from "react-router-dom";
import { Customer } from "@/types/search";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth";
import CustomerAvatar from "./CustomerAvatar";
import CustomerInfo from "./CustomerInfo";
import CustomerActions from "./CustomerActions";
import ExpandedCustomerView from "./ExpandedCustomerView";

interface CustomerCardProps {
  customer: Customer;
  customerReviews: {[key: string]: any[]};
  expandedCustomerId: string | null;
  handleSelectCustomer: (customerId: string) => void;
  hasFullAccess: (customerId: string) => boolean;
}

const CustomerCard = ({
  customer,
  customerReviews,
  expandedCustomerId,
  handleSelectCustomer,
  hasFullAccess
}: CustomerCardProps) => {
  const { currentUser, isSubscribed, hasOneTimeAccess } = useAuth();
  const navigate = useNavigate();
  const isExpanded = expandedCustomerId === customer.id;
  const isBusinessUser = currentUser?.type === "business" || currentUser?.type === "admin";
  const isReviewCustomer = customer.id.startsWith('review-customer-');
  const reviews = customerReviews[customer.id] || [];
  const hasAccess = currentUser && (isSubscribed || hasOneTimeAccess(customer.id));

  const handleViewProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isReviewCustomer) {
      navigate(`/customer/${customer.id}`);
    }
  };

  const handleUnlockReviews = () => {
    navigate('/signup?unlock=review');
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasAccess) {
      handleSelectCustomer(customer.id);
    } else {
      handleUnlockReviews();
    }
  };

  const handleExpandClick = () => {
    handleSelectCustomer(customer.id);
  };

  return (
    <Card 
      className={`p-4 transition-shadow hover:shadow-md ${isExpanded ? 'shadow-md' : ''}`}
      onClick={currentUser ? () => handleSelectCustomer(customer.id) : undefined}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-start space-x-3 flex-1">
          <CustomerAvatar
            customer={customer}
            isReviewCustomer={isReviewCustomer}
            isBusinessUser={isBusinessUser}
            onViewProfile={handleViewProfile}
          />
          
          <CustomerInfo
            customer={customer}
            isBusinessUser={isBusinessUser}
            isReviewCustomer={isReviewCustomer}
            onViewProfile={handleViewProfile}
            hasAccess={!!hasAccess}
          />
        </div>

        <CustomerActions
          currentUser={currentUser}
          hasAccess={hasAccess}
          isExpanded={isExpanded}
          onActionClick={handleActionClick}
          onExpandClick={handleExpandClick}
        />
      </div>

      {isExpanded && currentUser && (
        <ExpandedCustomerView
          customer={customer}
          reviews={reviews}
          hasFullAccess={hasFullAccess}
          isReviewCustomer={isReviewCustomer}
        />
      )}
    </Card>
  );
};

export default CustomerCard;
