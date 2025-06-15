
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth";
import { useNavigate } from "react-router-dom";
import CustomerActions from "./CustomerActions";
import ExpandedCustomerView from "./ExpandedCustomerView";
import NoReviews from "./NoReviews";
import CustomerBasicInfo from "./CustomerBasicInfo";
import CustomerContactInfo from "./CustomerContactInfo";
import CustomerReviewBadge from "./CustomerReviewBadge";

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
  
  // Create a function that checks full access for a given customer ID
  const hasFullAccessFunction = (customerId: string): boolean => {
    return isSubscribed || hasOneTimeAccess(customerId);
  };

  // Calculate average rating with precise decimal
  const calculateAverageRating = () => {
    if (!customer.reviews || customer.reviews.length === 0) return 0;
    const total = customer.reviews.reduce((sum, review) => sum + review.rating, 0);
    return total / customer.reviews.length;
  };

  // Sort reviews to put verified businesses first, then by date
  const sortedReviews = customer.reviews ? [...customer.reviews].sort((a, b) => {
    // First, prioritize verified reviewers
    if (a.reviewerVerified !== b.reviewerVerified) {
      return b.reviewerVerified ? 1 : -1;
    }
    
    // Then sort by date (newest first)
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  }) : [];

  const getCustomerInfo = () => {
    const info = [];
    
    // Customer name - always show this
    const name = [customer.firstName, customer.lastName].filter(Boolean).join(' ');
    if (name) info.push({ label: 'Name', value: name });
    
    // Phone - show for everyone (this is public identifying information from the review)
    if (customer.phone) {
      info.push({ label: 'Phone', value: customer.phone });
    }
    
    // Address - show for everyone (this is public identifying information from the review)
    if (customer.address) {
      info.push({ label: 'Address', value: customer.address });
    }
    
    // City, State, Zip - show for everyone (this is public identifying information from the review)
    const location = [customer.city, customer.state, customer.zipCode].filter(Boolean).join(', ');
    if (location) {
      info.push({ label: 'Location', value: location });
    }
    
    return info;
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

  const customerInfo = getCustomerInfo();
  const averageRating = calculateAverageRating();
  const hasReviews = customer.reviews && customer.reviews.length > 0;
  const hasAccess = currentUser && hasFullAccessFunction(customer.id);
  const customerName = customerInfo.find(info => info.label === 'Name')?.value || 'Unknown Customer';

  return (
    <Card className="mb-4 hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-4">
        <div className={`flex items-start justify-between ${currentUser ? 'cursor-pointer' : ''}`} onClick={handleCardClick}>
          <div className="flex-grow min-w-0">
            {/* Customer name with average rating and verification badge */}
            <CustomerBasicInfo 
              customerName={customerName}
              hasReviews={hasReviews}
              averageRating={averageRating}
              currentUser={currentUser}
              hasAccess={hasAccess}
              isVerified={customer.verified || false}
            />

            {/* Customer information - show all identifying info for everyone */}
            <CustomerContactInfo 
              customerInfo={customerInfo}
              currentUser={currentUser}
            />
            
            {/* Review count */}
            <CustomerReviewBadge 
              hasReviews={hasReviews}
              reviewCount={customer.reviews?.length || 0}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <CustomerActions 
              currentUser={currentUser}
              hasAccess={hasFullAccessFunction(customer.id)}
              isExpanded={isExpanded}
              onActionClick={(e) => e.stopPropagation()}
              onExpandClick={handleCardClick}
            />
            {currentUser && (
              <Button variant="ghost" size="sm">
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>
        
        {isExpanded && currentUser && (
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
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerCard;
