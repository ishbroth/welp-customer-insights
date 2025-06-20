
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth";
import { useNavigate } from "react-router-dom";
import CustomerCardHeader from "./CustomerCardHeader";
import CustomerCardExpandedContent from "./CustomerCardExpandedContent";
import CustomerCardActionsSection from "./CustomerCardActionsSection";
import { useCustomerCardData } from "@/hooks/useCustomerCardData";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
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
        {/* Header with customer on left, business summary on right */}
        <div className="flex items-start justify-between">
          {/* Customer info - left side (larger) */}
          <div className="flex items-center space-x-4 cursor-pointer" onClick={handleCardClick}>
            <Avatar className="h-12 w-12">
              <AvatarImage src={customer.avatar} alt={customerName} />
              <AvatarFallback className="bg-blue-100 text-blue-800">
                {getInitials(customerName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">{customerName}</h3>
                {isVerified && <VerifiedBadge size="sm" />}
              </div>
              <p className="text-sm text-gray-500">Customer</p>
              {hasAccess && customerInfoText && (
                <p className="text-sm text-gray-600">{customerInfoText}</p>
              )}
            </div>
          </div>

          {/* Review summary - right side (smaller) */}
          {hasReviews && (
            <div className="flex items-center space-x-2">
              <div className="text-right">
                <div className="flex items-center gap-1 justify-end mb-1">
                  <StarRating rating={averageRating} size="sm" />
                  <span className="text-sm font-medium">{averageRating.toFixed(1)}</span>
                </div>
                <p className="text-xs text-gray-500">
                  {customer.reviews?.length || 0} review{(customer.reviews?.length || 0) !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          )}
          
          <CustomerCardActionsSection
            currentUser={currentUser}
            hasAccess={hasFullAccessFunction(customer.id)}
            isExpanded={isExpanded}
            onActionClick={(e) => e.stopPropagation()}
            onExpandClick={handleCardClick}
          />
        </div>
        
        {/* Expanded content showing individual reviews */}
        {isExpanded && currentUser && (
          <div className="mt-4 space-y-4">
            {sortedReviews.map((review) => (
              <div key={review.id} className="border-l-4 border-blue-200 pl-4 py-2">
                {/* Review header with business on left, customer on right */}
                <div className="flex items-start justify-between mb-2">
                  {/* Business info - left side (larger) */}
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={review.reviewerAvatar || ""} alt={review.reviewerName} />
                      <AvatarFallback className="bg-green-100 text-green-800">
                        {getInitials(review.reviewerName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{review.reviewerName}</h4>
                        {review.reviewerVerified && <VerifiedBadge size="sm" />}
                      </div>
                      <p className="text-xs text-gray-500">Business</p>
                    </div>
                  </div>

                  {/* Customer info - right side (smaller) */}
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={customer.avatar} alt={customerName} />
                      <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                        {getInitials(customerName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs font-medium">{customerName}</p>
                      <p className="text-xs text-gray-500">Customer</p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-2">
                  <StarRating rating={review.rating} size="sm" />
                  <span className="ml-2 text-xs text-gray-500">
                    {new Date(review.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{review.content}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerCard;
