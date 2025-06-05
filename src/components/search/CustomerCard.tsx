
import { useState } from "react";
import { MapPin, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth";
import { useNavigate } from "react-router-dom";
import CustomerActions from "./CustomerActions";
import ExpandedCustomerView from "./ExpandedCustomerView";
import NoReviews from "./NoReviews";
import StarRating from "@/components/StarRating";

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
    
    // Customer name
    const name = [customer.firstName, customer.lastName].filter(Boolean).join(' ');
    if (name) info.push({ label: 'Name', value: name });
    
    // Phone
    if (customer.phone) info.push({ label: 'Phone', value: customer.phone });
    
    // Address
    if (customer.address) info.push({ label: 'Address', value: customer.address });
    
    // City, State, Zip
    const location = [customer.city, customer.state, customer.zipCode].filter(Boolean).join(', ');
    if (location) info.push({ label: 'Location', value: location });
    
    return info;
  };

  const handleViewProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isBusinessUser && hasFullAccessFunction(customer.id)) {
      navigate(`/customer/${customer.id}`);
    }
  };

  const handleCardClick = () => {
    setIsExpanded(!isExpanded);
  };

  const customerInfo = getCustomerInfo();
  const averageRating = calculateAverageRating();
  const hasReviews = customer.reviews && customer.reviews.length > 0;

  return (
    <Card className="mb-4 hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between cursor-pointer" onClick={handleCardClick}>
          <div className="flex-grow min-w-0">
            {/* Customer name with average rating */}
            <div className="flex items-center gap-3 mb-3">
              <h3 className="font-semibold text-lg">
                {customerInfo.find(info => info.label === 'Name')?.value || 'Unknown Customer'}
              </h3>
              {hasReviews && (
                <div className="flex items-center gap-2">
                  <StarRating rating={averageRating} size="sm" />
                  <span className="text-sm text-gray-600 font-medium">
                    {averageRating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>

            {/* Customer information */}
            <div className="space-y-1 text-sm text-gray-600 mb-3">
              {customerInfo.filter(info => info.label !== 'Name').map((info, index) => (
                <div key={index} className="flex items-start gap-1">
                  {info.label === 'Location' && <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />}
                  <span className="font-medium">{info.label}:</span>
                  <span>{info.value}</span>
                </div>
              ))}
            </div>
            
            {/* Review count */}
            {hasReviews ? (
              <Badge variant="secondary" className="text-xs">
                {customer.reviews.length} review{customer.reviews.length !== 1 ? 's' : ''}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs text-gray-500">
                No reviews
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <CustomerActions 
              currentUser={currentUser}
              hasAccess={hasFullAccessFunction(customer.id)}
              isExpanded={isExpanded}
              onActionClick={(e) => e.stopPropagation()}
              onExpandClick={handleCardClick}
            />
            <Button variant="ghost" size="sm">
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        {isExpanded && (
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
