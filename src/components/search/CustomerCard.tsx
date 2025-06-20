
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth";
import { useNavigate } from "react-router-dom";
import CustomerCardActionsSection from "./CustomerCardActionsSection";
import { useCustomerCardData } from "@/hooks/useCustomerCardData";
import CustomerCardMainHeader from "./CustomerCardMainHeader";
import CustomerCardReviewItem from "./CustomerCardReviewItem";

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
      reviewerAvatar?: string;
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
  
  const getInitials = (name: string) => {
    if (name) {
      const names = name.split(' ');
      return names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return "U";
  };
  
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

  // Format customer info for display
  const customerInfoText = customerInfo.map(info => info.value).join(' • ');

  return (
    <Card className="mb-4 hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-4">
        <CustomerCardMainHeader
          customerName={customerName}
          customerAvatar={customer.avatar}
          isVerified={isVerified}
          hasReviews={hasReviews}
          averageRating={averageRating}
          reviewCount={customer.reviews?.length || 0}
          customerInfoText={customerInfoText}
          hasAccess={!!hasAccess}
          getInitials={getInitials}
          onClick={handleCardClick}
        />
        
        <CustomerCardActionsSection
          currentUser={currentUser}
          hasAccess={hasFullAccessFunction(customer.id)}
          isExpanded={isExpanded}
          onActionClick={(e) => e.stopPropagation()}
          onExpandClick={handleCardClick}
        />
        
        {/* Expanded content showing individual reviews */}
        {isExpanded && currentUser && (
          <div className="mt-4 space-y-4">
            {sortedReviews.map((review) => (
              <CustomerCardReviewItem
                key={review.id}
                review={review}
                customerName={customerName}
                customerAvatar={customer.avatar}
                getInitials={getInitials}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerCard;
