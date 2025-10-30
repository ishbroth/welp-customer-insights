
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Customer } from "@/types/search";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Star, User } from "lucide-react";
import ReviewsList from "./ReviewsList";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import { useAuth } from "@/contexts/auth";
import { getInitials } from "@/utils/stringUtils";

interface CustomerCardProps {
  customer: Customer;
  hasFullAccess: (customerId: string) => boolean;
  onReviewUpdate?: () => void;
}

const CustomerCard = ({ customer, hasFullAccess, onReviewUpdate }: CustomerCardProps) => {
  const [showAllReviews, setShowAllReviews] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const displayedReviews = showAllReviews ? customer.reviews || [] : (customer.reviews || []).slice(0, 6);
  const hasMoreReviews = (customer.reviews || []).length > 6;

  const handleViewProfile = () => {
    // Navigate to read-only customer profile
    navigate(`/customer-profile/${customer.id}`, {
      state: { 
        customer,
        readOnly: true,
        showWriteReviewButton: currentUser?.type === 'business'
      }
    });
  };

  // Use the hasFullAccess function passed from parent to determine profile visibility
  const hasViewableProfile = () => {
    return hasFullAccess(customer.id);
  };

  const handleWriteReview = () => {
    // Check if user is logged in
    if (!currentUser) {
      // Store customer data for post-login redirect
      const customerData = {
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        phone: customer.phone || '',
        address: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        zipCode: customer.zipCode || ''
      };
      
      sessionStorage.setItem('pendingReviewData', JSON.stringify(customerData));
      navigate('/login');
      return;
    }

    // Check if user is a business (only businesses can write reviews about customers)
    if (currentUser.type !== 'business') {
      // Customer users shouldn't see this button, but if they somehow click it, redirect to home
      navigate('/');
      return;
    }

    // Navigate to new review form with customer info pre-filled
    const params = new URLSearchParams({
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      phone: customer.phone || '',
      address: customer.address || '',
      city: customer.city || '',
      state: customer.state || '',
      zipCode: customer.zipCode || ''
    });
    
    navigate(`/review/new?${params.toString()}`);
  };

  // Check if current user has already reviewed this customer
  const hasAlreadyReviewed = () => {
    if (!currentUser || currentUser.type !== 'business') return false;
    return customer.reviews?.some(review => review.reviewerId === currentUser.id) || false;
  };

  // Only show write review button for business users or non-logged users
  const showWriteReviewButton = !currentUser || currentUser.type === 'business';
  const alreadyReviewed = hasAlreadyReviewed();

  return (
    <Card className="w-full rounded-none">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={customer.avatar} alt={
                customer.isAssociateMatch && customer.associateData
                  ? `${customer.associateData.firstName} ${customer.associateData.lastName}`
                  : `${customer.firstName} ${customer.lastName}`
              } />
              <AvatarFallback className="bg-blue-100 text-blue-800">
                {customer.isAssociateMatch && customer.associateData
                  ? getInitials(`${customer.associateData.firstName} ${customer.associateData.lastName}`)
                  : getInitials(`${customer.firstName} ${customer.lastName}`)
                }
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              {customer.isAssociateMatch && (
                <div className="mb-1">
                  <Badge variant="secondary" className="text-xs">
                    Associate Match
                  </Badge>
                </div>
              )}

              <div className="flex items-center gap-2 mb-1">
                <h3
                  className={`font-semibold text-lg ${
                    hasViewableProfile()
                      ? "cursor-pointer hover:text-blue-600 transition-colors"
                      : "text-gray-400"
                  }`}
                  onClick={hasViewableProfile() ? handleViewProfile : undefined}
                >
                  {customer.isAssociateMatch && customer.associateData
                    ? `${customer.associateData.firstName} ${customer.associateData.lastName}`
                    : `${customer.firstName} ${customer.lastName}`
                  }
                </h3>
                {customer.verified && <VerifiedBadge size="sm" />}
              </div>

              {customer.isAssociateMatch && (
                <div className="text-xs text-gray-500 mb-2">
                  Associate of: {customer.firstName} {customer.lastName}
                </div>
              )}
              
              <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                {customer.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    <span>{customer.phone}</span>
                  </div>
                )}
                
                {(customer.address || customer.city || customer.state) && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>
                      {[customer.address, customer.city, customer.state].filter(Boolean).join(', ')}
                      {customer.zipCode && ` ${customer.zipCode}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              {customer.reviews?.length || 0} reviews
            </Badge>
            
            {showWriteReviewButton && (
              <Button
                size="sm"
                variant={alreadyReviewed ? "outline" : "default"}
                disabled={alreadyReviewed}
                onClick={handleWriteReview}
                className={alreadyReviewed ? "text-muted-foreground cursor-not-allowed" : ""}
              >
                {alreadyReviewed ? "Already Reviewed" : "Write Review"}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 px-0">
        {customer.reviews && customer.reviews.length > 0 ? (
          <div>
            <ReviewsList
              reviews={displayedReviews}
              hasFullAccess={hasFullAccess}
              customerData={customer}
              onReviewUpdate={onReviewUpdate}
            />

            {hasMoreReviews && !showAllReviews && (
              <div className="text-center mt-4 px-6">
                <Button
                  variant="outline"
                  onClick={() => setShowAllReviews(true)}
                >
                  Show {(customer.reviews?.length || 0) - 2} more reviews
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 px-6 text-gray-500">
            <div className="mb-2">
              <User className="h-8 w-8 mx-auto text-gray-400" />
            </div>
            <p className="text-sm">No reviews yet</p>
            <p className="text-xs text-gray-400 mb-3">Be the first to review this customer</p>
            {showWriteReviewButton && (
              <Button 
                size="sm" 
                variant={alreadyReviewed ? "outline" : "default"}
                disabled={alreadyReviewed}
                onClick={handleWriteReview}
                className={alreadyReviewed ? "text-muted-foreground cursor-not-allowed" : ""}
              >
                {alreadyReviewed ? "Already Reviewed" : "Write First Review"}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerCard;
