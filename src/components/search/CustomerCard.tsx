
import { Link, useNavigate } from "react-router-dom";
import { Customer } from "@/types/search";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import StarRating from "@/components/StarRating";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth";
import ReviewsList from "./ReviewsList";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const hasSubscription = customer.isSubscriptionNeeded;

  // Get the reviews for this customer
  const reviews = customerReviews[customer.id] || [];
  
  // Check if current business user has already written a review for this customer
  const hasCurrentUserReviewed = () => {
    if (!currentUser || !isBusinessUser) return false;
    
    return reviews.some(review => review.reviewerId === currentUser.id);
  };
  
  const handleViewProfile = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent expanding/collapsing the card
    // Only navigate to profile if this is a regular customer (not from reviews)
    if (!isReviewCustomer) {
      navigate(`/customer/${customer.id}`);
    }
  };

  const handleUnlockReviews = () => {
    // Navigate to signup page with unlock indicator
    navigate('/signup?unlock=review');
  };

  const getInitials = () => {
    const firstInitial = customer.firstName ? customer.firstName[0] : "";
    const lastInitial = customer.lastName ? customer.lastName[0] : "";
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  // Get customer avatar - use actual avatar if customer has profile, otherwise use generic
  const getCustomerAvatar = () => {
    // If this is a review-generated customer (no actual profile), return null for generic avatar
    if (isReviewCustomer) {
      return null;
    }
    // If this is a real customer profile, return their avatar
    return customer.avatar || null;
  };

  // Prepare customer data for ReviewsList
  const customerData = {
    firstName: customer.firstName,
    lastName: customer.lastName,
    phone: customer.phone || "",
    address: customer.address || "",
    city: customer.city || "",
    state: customer.state || "",
    zipCode: customer.zipCode || ""
  };

  // Check if user has access (subscription or one-time access)
  const hasAccess = currentUser && (isSubscribed || hasOneTimeAccess(customer.id));

  // If user is not signed in, show simplified view
  if (!currentUser) {
    return (
      <Card className="p-4 transition-shadow hover:shadow-md">
        <div className="flex items-start space-x-3">
          <Button 
            onClick={handleUnlockReviews}
            size="sm"
            variant="default"
            className="flex-shrink-0"
          >
            Unlock Reviews
          </Button>
          
          <Avatar className="h-10 w-10 border border-gray-200 flex-shrink-0">
            {getCustomerAvatar() ? (
              <AvatarImage src={getCustomerAvatar()!} alt={`${customer.firstName} ${customer.lastName}`} />
            ) : (
              <AvatarFallback className="bg-gray-200 text-gray-800">
                {getInitials()}
              </AvatarFallback>
            )}
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center">
              <h3 className="font-medium text-lg">
                {customer.firstName} {customer.lastName}
              </h3>
              
              {customer.totalReviews > 0 && (
                <Badge variant="outline" className="ml-2">
                  {customer.totalReviews} {customer.totalReviews === 1 ? 'review' : 'reviews'}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center mt-1">
              {customer.averageRating > 0 && (
                <div className="flex items-center">
                  <StarRating rating={customer.averageRating} />
                  <span className="ml-2 text-sm text-gray-500">
                    {customer.averageRating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
            
            {/* Address info and other details */}
            <div className="mt-2 text-sm text-gray-600">
              {customer.address && (
                <p>{customer.address}</p>
              )}
              {(customer.city || customer.state || customer.zipCode) && (
                <p>
                  {customer.city}{customer.city && customer.state ? ', ' : ''}{customer.state} {customer.zipCode}
                </p>
              )}
              {customer.phone && (
                <p className="mt-1">Phone: {customer.phone}</p>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // For signed-in users, show the button with appropriate text and functionality
  return (
    <Card 
      className={`p-4 transition-shadow hover:shadow-md ${isExpanded ? 'shadow-md' : ''}`}
      onClick={() => handleSelectCustomer(customer.id)}
    >
      {/* Customer basic info */}
      <div className="flex justify-between items-start">
        <div className="flex items-start space-x-3">
          {/* Action button on the left */}
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              if (hasAccess) {
                handleSelectCustomer(customer.id);
              } else {
                handleUnlockReviews();
              }
            }}
            size="sm"
            variant={hasAccess ? "secondary" : "default"}
            className="flex-shrink-0"
          >
            {hasAccess ? "View Review" : "Unlock Reviews"}
          </Button>

          {/* Add avatar for customer */}
          {isBusinessUser && (
            <div onClick={handleViewProfile} className="cursor-pointer flex-shrink-0">
              <Avatar className="h-10 w-10 border border-gray-200">
                {getCustomerAvatar() ? (
                  <AvatarImage src={getCustomerAvatar()!} alt={`${customer.firstName} ${customer.lastName}`} />
                ) : (
                  <AvatarFallback className="bg-gray-200 text-gray-800">
                    {getInitials()}
                  </AvatarFallback>
                )}
              </Avatar>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center">
              {isBusinessUser && !isReviewCustomer ? (
                <h3 
                  className="font-medium text-lg text-primary hover:underline cursor-pointer"
                  onClick={handleViewProfile}
                >
                  {customer.firstName} {customer.lastName}
                </h3>
              ) : (
                <h3 className="font-medium text-lg">
                  {customer.firstName} {customer.lastName}
                </h3>
              )}
              
              {customer.totalReviews > 0 && (
                <Badge variant="outline" className="ml-2">
                  {customer.totalReviews} {customer.totalReviews === 1 ? 'review' : 'reviews'}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center mt-1">
              {customer.averageRating > 0 && (
                <div className="flex items-center">
                  <StarRating rating={customer.averageRating} />
                  <span className="ml-2 text-sm text-gray-500">
                    {customer.averageRating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
            
            {/* Address info and other details */}
            <div className="mt-2 text-sm text-gray-600">
              {customer.address && (
                <p>{customer.address}</p>
              )}
              {(customer.city || customer.state || customer.zipCode) && (
                <p>
                  {customer.city}{customer.city && customer.state ? ', ' : ''}{customer.state} {customer.zipCode}
                </p>
              )}
              {customer.phone && (
                <p className="mt-1">Phone: {customer.phone}</p>
              )}
            </div>
          </div>
        </div>

        {/* Expand/collapse button - only for signed-in users */}
        <Button variant="ghost" size="sm" className="rounded-full p-1 flex-shrink-0">
          {isExpanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Expanded section with reviews - only for signed-in users */}
      {isExpanded && (
        <div className="mt-4 border-t pt-3">
          <ReviewsList 
            customerId={customer.id} 
            reviews={reviews}
            hasFullAccess={hasFullAccess}
            isReviewCustomer={isReviewCustomer}
            customerData={customerData}
          />

          {/* Write a review button - only show for business users who haven't reviewed this customer */}
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
      )}
    </Card>
  );
};

export default CustomerCard;
