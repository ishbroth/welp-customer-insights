
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { Star, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ReviewCardProps {
  review: {
    id: string;
    reviewerId: string;
    reviewerName: string;
    reviewerAvatar?: string;
    reviewerVerified?: boolean;
    rating: number;
    content: string;
    date: string;
    customerId?: string;
    customerName: string;
    customer_phone?: string;
    customer_address?: string;
    customer_city?: string;
    customer_zipcode?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  hasSubscription: boolean;
  isOneTimeUnlocked: boolean;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  hasSubscription,
  isOneTimeUnlocked,
}) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const isUnlocked = hasSubscription || isOneTimeUnlocked;
  const canViewFullContent = isUnlocked;

  // Fetch customer profile if review is claimed (has customerId)
  const { data: customerProfile } = useQuery({
    queryKey: ['customerProfile', review.customerId],
    queryFn: async () => {
      if (!review.customerId) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, avatar, first_name, last_name, name, phone, address, city, state, zipcode')
        .eq('id', review.customerId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching customer profile:", error);
        return null;
      }
      
      return data;
    },
    enabled: !!review.customerId && canViewFullContent
  });

  const handleBusinessNameClick = () => {
    if (!canViewFullContent) return;
    
    // Navigate to business profile
    navigate(`/business-profile/${review.reviewerId}`, {
      state: { 
        readOnly: true,
        showRespondButton: currentUser?.type === 'customer',
        reviewId: review.id
      }
    });
  };

  const handleCustomerNameClick = () => {
    if (!review.customerId || !canViewFullContent) return;
    
    // Navigate to customer profile
    navigate(`/customer-profile/${review.customerId}`, {
      state: { 
        readOnly: true,
        showWriteReviewButton: currentUser?.type === 'business'
      }
    });
  };

  const getInitials = (name: string) => {
    if (name) {
      const names = name.split(' ');
      return names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return "U";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Determine customer info to display
  const getCustomerDisplayInfo = () => {
    if (review.customerId && customerProfile) {
      // Review is claimed - use customer profile info
      const customerName = customerProfile.first_name && customerProfile.last_name 
        ? `${customerProfile.first_name} ${customerProfile.last_name}`
        : customerProfile.name || review.customerName;
      
      return {
        name: customerName,
        avatar: customerProfile.avatar || '',
        phone: customerProfile.phone || '',
        address: customerProfile.address || '',
        city: customerProfile.city || '',
        state: customerProfile.state || '',
        zipcode: customerProfile.zipcode || '',
        isClaimed: true
      };
    } else {
      // Review is not claimed - use review data
      return {
        name: review.customerName,
        avatar: '',
        phone: review.customer_phone || '',
        address: review.customer_address || review.address || '',
        city: review.customer_city || review.city || '',
        state: review.state || '',
        zipcode: review.customer_zipcode || review.zipCode || '',
        isClaimed: false
      };
    }
  };

  const customerInfo = getCustomerDisplayInfo();

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          {/* Business info - left side */}
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={review.reviewerAvatar} alt={review.reviewerName} />
              <AvatarFallback className="bg-blue-100 text-blue-800">
                {getInitials(review.reviewerName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-1">
                {canViewFullContent ? (
                  <h4 
                    className="font-medium cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={handleBusinessNameClick}
                  >
                    {review.reviewerName}
                  </h4>
                ) : (
                  <h4 className="font-medium text-gray-400">
                    {review.reviewerName}
                  </h4>
                )}
                {review.reviewerVerified && <VerifiedBadge size="xs" />}
              </div>
              <p className="text-sm text-gray-500">Business</p>
            </div>
          </div>

          {/* Customer info - right side */}
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              <Avatar className="h-8 w-8">
                <AvatarImage src={customerInfo.avatar} alt={customerInfo.name} />
                <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                  {getInitials(customerInfo.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                {customerInfo.isClaimed && canViewFullContent ? (
                  <h4 
                    className="font-medium cursor-pointer hover:text-blue-600 transition-colors text-sm"
                    onClick={handleCustomerNameClick}
                  >
                    {customerInfo.name}
                  </h4>
                ) : (
                  <h4 className="font-medium text-sm">
                    {customerInfo.name}
                  </h4>
                )}
                <p className="text-xs text-gray-500">Customer</p>
                {customerInfo.isClaimed && (
                  <span className="text-xs text-green-600 font-medium">Claimed</span>
                )}
              </div>
            </div>
            
            {/* Show customer contact info if available and unlocked */}
            {canViewFullContent && (
              <div className="mt-2 text-xs text-gray-600 space-y-1">
                {customerInfo.phone && (
                  <div>📞 {customerInfo.phone}</div>
                )}
                {customerInfo.address && (
                  <div>📍 {customerInfo.address}</div>
                )}
                {(customerInfo.city || customerInfo.zipcode) && (
                  <div>
                    {[customerInfo.city, customerInfo.state, customerInfo.zipcode]
                      .filter(Boolean)
                      .join(', ')}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Rating and Date */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < review.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {review.rating}/5
            </span>
          </div>
          <span className="text-sm text-gray-500">
            {formatDate(review.date)}
          </span>
        </div>

        {/* Review Content */}
        <div className="mb-4">
          {canViewFullContent ? (
            <p className="text-gray-700 leading-relaxed">{review.content}</p>
          ) : (
            <div className="relative">
              <p className="text-gray-400 leading-relaxed blur-sm select-none">
                {review.content.substring(0, 100)}...
              </p>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white"></div>
            </div>
          )}
        </div>

        {/* Action buttons for locked content */}
        {!canViewFullContent && (
          <div className="flex gap-2 pt-2 border-t">
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/one-time-review-access?reviewId=${review.id}`)}
              className="flex-1"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Unlock Review ($3)
            </Button>
            <Button
              size="sm"
              onClick={() => navigate('/subscription')}
              className="flex-1"
            >
              Get Full Access
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReviewCard;
