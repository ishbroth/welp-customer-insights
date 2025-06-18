
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth";
import { useNavigate } from "react-router-dom";
import CustomerCardHeader from "./CustomerCardHeader";
import CustomerCardExpandedContent from "./CustomerCardExpandedContent";
import CustomerCardActionsSection from "./CustomerCardActionsSection";
import { useCustomerCardData } from "@/hooks/useCustomerCardData";

interface CustomerCardProps {
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    avatar?: string;
    verified?: boolean;
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
  searchCriteria?: string;
  isReviewCustomer?: boolean;
  onReviewUpdate?: () => void;
}

const CustomerCard = ({ 
  customer, 
  searchCriteria, 
  isReviewCustomer = false, 
  onReviewUpdate 
}: CustomerCardProps) => {
  const { currentUser, isSubscribed, hasOneTimeAccess } = useAuth();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const isBusinessUser = currentUser?.type === "business" || currentUser?.type === "admin";

  const {
    customerInfo,
    averageRating,
    hasReviews,
    customerName,
    isVerified,
    sortedReviews
  } = useCustomerCardData(customer);
  
  // Create a function that checks full access for a given customer ID
  const hasFullAccessFunction = (customerId: string): boolean => {
    return isSubscribed || hasOneTimeAccess(customerId);
  };

  const handleViewProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isBusinessUser && hasFullAccessFunction(customer.id)) {
      navigate(`/customer/${customer.id}`);
    }
  };

  const handleCardClick = () => {
    // Only allow expansion if user is logged in
    if (!currentUser) {
      return;
    }
    setIsExpanded(!isExpanded);
  };

  const hasAccess = currentUser && hasFullAccessFunction(customer.id);

  return (
    <Card className="mb-4 hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <CustomerCardHeader
            customerName={customerName}
            customerInfo={customerInfo}
            hasReviews={hasReviews}
            averageRating={averageRating}
            reviewCount={customer.reviews?.length || 0}
            currentUser={currentUser}
            hasAccess={hasAccess}
            isVerified={isVerified}
            onClick={handleCardClick}
          />
          
          <CustomerCardActionsSection
            currentUser={currentUser}
            hasAccess={hasFullAccessFunction(customer.id)}
            isExpanded={isExpanded}
            onActionClick={(e) => e.stopPropagation()}
            onExpandClick={handleCardClick}
          />
        </div>
        
        {isExpanded && currentUser && (
          <CustomerCardExpandedContent
            customer={customer}
            sortedReviews={sortedReviews}
            hasFullAccessFunction={hasFullAccessFunction}
            isReviewCustomer={isReviewCustomer}
            onReviewUpdate={onReviewUpdate}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerCard;
