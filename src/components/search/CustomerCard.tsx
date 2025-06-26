
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
      // Additional customer info from reviews - always show regardless of auth status
      customer_phone?: string;
      customer_address?: string;
      customer_city?: string;
      customer_zipcode?: string;
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

  // Enhanced customer info collection that shows ALL available information
  const getAllCustomerInfo = () => {
    const infoItems: Array<{label: string; value: string}> = [];
    
    // Add profile info if available
    if (customer.phone) {
      infoItems.push({ label: 'Phone', value: customer.phone });
    }
    if (customer.address) {
      infoItems.push({ label: 'Address', value: customer.address });
    }
    if (customer.city) {
      infoItems.push({ label: 'City', value: customer.city });
    }
    if (customer.state) {
      infoItems.push({ label: 'State', value: customer.state });
    }
    if (customer.zipCode) {
      infoItems.push({ label: 'ZIP', value: customer.zipCode });
    }
    
    // Add info from reviews - this should always be visible
    const reviewInfo = new Set<string>();
    customer.reviews?.forEach(review => {
      if (review.customer_phone && !infoItems.some(item => item.label === 'Phone')) {
        infoItems.push({ label: 'Phone', value: review.customer_phone });
      }
      if (review.customer_address && !infoItems.some(item => item.label === 'Address')) {
        infoItems.push({ label: 'Address', value: review.customer_address });
      }
      if (review.customer_city && !infoItems.some(item => item.label === 'City')) {
        infoItems.push({ label: 'City', value: review.customer_city });
      }
      if (review.customer_zipcode && !infoItems.some(item => item.label === 'ZIP')) {
        infoItems.push({ label: 'ZIP', value: review.customer_zipcode });
      }
    });
    
    return infoItems;
  };

  const customerInfoItems = getAllCustomerInfo();

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
          customerInfoText="" // We'll show structured info below instead
          hasAccess={!!hasAccess}
          getInitials={getInitials}
          onClick={handleCardClick}
        />
        
        {/* Display customer information in a structured way */}
        {customerInfoItems.length > 0 && (
          <div className="mt-3 space-y-1">
            {customerInfoItems.map((item, index) => (
              <div key={index} className="text-sm text-gray-600">
                <span className="font-medium">{item.label}:</span> {item.value}
              </div>
            ))}
          </div>
        )}
        
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
