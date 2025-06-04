
import { useState } from "react";
import { MapPin, User, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth";
import { useNavigate } from "react-router-dom";
import CustomerAvatar from "./CustomerAvatar";
import ReviewsList from "./ReviewsList";
import CustomerActions from "./CustomerActions";
import ExpandedCustomerView from "./ExpandedCustomerView";
import NoReviews from "./NoReviews";
import VerifiedBadge from "@/components/ui/VerifiedBadge";

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
}

const CustomerCard = ({ customer, searchCriteria, isReviewCustomer = false }: CustomerCardProps) => {
  const { currentUser, isSubscribed, hasOneTimeAccess } = useAuth();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const isBusinessUser = currentUser?.type === "business" || currentUser?.type === "admin";
  
  // Create a function that checks full access for a given customer ID
  const hasFullAccessFunction = (customerId: string): boolean => {
    return isSubscribed || hasOneTimeAccess(customerId);
  };
  
  // Check if customer has verified reviews and log the review data
  const hasVerifiedReviews = customer.reviews?.some(review => {
    console.log(`CustomerCard: Review ${review.id} from ${review.reviewerName} - verified: ${review.reviewerVerified}`);
    return review.reviewerVerified;
  }) || false;

  console.log(`CustomerCard: Customer ${customer.firstName} ${customer.lastName} has verified reviews: ${hasVerifiedReviews}`);
  console.log(`CustomerCard: All reviews:`, customer.reviews?.map(r => ({ 
    reviewerName: r.reviewerName, 
    verified: r.reviewerVerified 
  })));

  const getLocationDisplay = () => {
    if (customer.city && customer.state) {
      return `${customer.city}, ${customer.state}`;
    }
    if (customer.zipCode) {
      return customer.zipCode;
    }
    return null;
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

  const location = getLocationDisplay();

  return (
    <Card className="mb-4 hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between cursor-pointer" onClick={handleCardClick}>
          <div className="flex items-start space-x-3 flex-grow">
            <CustomerAvatar 
              customer={customer}
              isReviewCustomer={isReviewCustomer}
              isBusinessUser={isBusinessUser}
              onViewProfile={handleViewProfile}
            />
            
            <div className="flex-grow min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">
                  {customer.firstName} {customer.lastName}
                </h3>
                {hasVerifiedReviews && (
                  <div>
                    <VerifiedBadge size="sm" />
                    <span className="sr-only">Has verified reviews</span>
                  </div>
                )}
              </div>
              
              {location && (
                <div className="flex items-center text-gray-600 text-sm mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  {location}
                </div>
              )}
              
              {customer.reviews && customer.reviews.length > 0 ? (
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {customer.reviews.length} review{customer.reviews.length !== 1 ? 's' : ''}
                  </Badge>
                  {hasVerifiedReviews && (
                    <Badge variant="outline" className="text-xs border-blue-200 text-blue-700">
                      Verified reviews
                    </Badge>
                  )}
                </div>
              ) : (
                <Badge variant="outline" className="text-xs text-gray-500">
                  No reviews
                </Badge>
              )}
            </div>
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
            {customer.reviews && customer.reviews.length > 0 ? (
              <ExpandedCustomerView 
                customer={customer}
                reviews={customer.reviews}
                hasFullAccess={hasFullAccessFunction}
                isReviewCustomer={isReviewCustomer}
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
