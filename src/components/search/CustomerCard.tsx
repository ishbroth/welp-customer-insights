
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

interface CustomerCardProps {
  customer: Customer;
  hasFullAccess: (customerId: string) => boolean;
  onReviewUpdate?: () => void;
}

const CustomerCard = ({ customer, hasFullAccess, onReviewUpdate }: CustomerCardProps) => {
  const [showAllReviews, setShowAllReviews] = useState(false);
  const navigate = useNavigate();

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  const displayedReviews = showAllReviews ? customer.reviews || [] : (customer.reviews || []).slice(0, 2);
  const hasMoreReviews = (customer.reviews || []).length > 2;

  const handleViewProfile = () => {
    // Navigate to read-only customer profile
    navigate(`/customer-profile/${customer.id}`, {
      state: { 
        customer,
        readOnly: true,
        showWriteReviewButton: true
      }
    });
  };

  const handleWriteReview = () => {
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
    
    navigate(`/new-review?${params.toString()}`);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={customer.avatar} alt={`${customer.firstName} ${customer.lastName}`} />
              <AvatarFallback className="bg-blue-100 text-blue-800">
                {getInitials(customer.firstName, customer.lastName)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 
                  className="font-semibold text-lg cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={handleViewProfile}
                >
                  {customer.firstName} {customer.lastName}
                </h3>
                {customer.verified && <VerifiedBadge size="sm" />}
              </div>
              
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
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewProfile}
                className="flex items-center gap-1"
              >
                <User className="h-3 w-3" />
                View Profile
              </Button>
              
              <Button
                size="sm"
                onClick={handleWriteReview}
              >
                Write Review
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {customer.reviews && customer.reviews.length > 0 ? (
          <div>
            <ReviewsList
              reviews={displayedReviews}
              hasFullAccess={hasFullAccess}
              customerData={customer}
              onReviewUpdate={onReviewUpdate}
            />
            
            {hasMoreReviews && !showAllReviews && (
              <div className="text-center mt-4">
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
          <div className="text-center py-6 text-gray-500">
            <div className="mb-2">
              <User className="h-8 w-8 mx-auto text-gray-400" />
            </div>
            <p className="text-sm">No reviews yet</p>
            <p className="text-xs text-gray-400 mb-3">Be the first to review this customer</p>
            <Button size="sm" onClick={handleWriteReview}>
              Write First Review
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerCard;
