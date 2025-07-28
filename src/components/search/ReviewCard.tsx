
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { Star, MessageCircle, Lock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import CustomerInfoDisplay from "@/components/review/CustomerInfoDisplay";
import { useCustomerInfo } from "@/hooks/useCustomerInfo";

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
  const { currentUser, isSubscribed } = useAuth();

  // Use subscription status from auth context instead of props
  const isUnlocked = isSubscribed || isOneTimeUnlocked;
  const canViewFullContent = isUnlocked;

  // Use the customer info system
  const customerInfo = useCustomerInfo({
    customer_name: review.customerName,
    customer_phone: review.customer_phone,
    customer_address: review.customer_address || review.address,
    customer_city: review.customer_city || review.city,
    customer_zipcode: review.customer_zipcode || review.zipCode,
    customerId: review.customerId
  });

  const handleBusinessNameClick = () => {
    if (!canViewFullContent) return;
    
    navigate(`/business-profile/${review.reviewerId}`, {
      state: { 
        readOnly: true,
        showRespondButton: currentUser?.type === 'customer',
        reviewId: review.id
      }
    });
  };

  const handleCustomerNameClick = () => {
    if (!customerInfo.isClaimed || !canViewFullContent) return;
    
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

  const handleOneTimeAccess = () => {
    if (!currentUser) {
      sessionStorage.setItem('pendingReviewAccess', JSON.stringify({
        reviewId: review.id,
        accessType: 'one-time'
      }));
      navigate('/login');
      return;
    }
    
    navigate(`/subscription?reviewId=${review.id}&type=one-time`);
  };

  const handleSubscriptionAccess = () => {
    if (!currentUser) {
      sessionStorage.setItem('pendingReviewAccess', JSON.stringify({
        reviewId: review.id,
        accessType: 'subscription'
      }));
      navigate('/login');
      return;
    }
    
    navigate('/subscription');
  };

  // Get first few words for preview
  const getPreviewText = (text: string) => {
    const words = text.split(' ');
    return words.slice(0, 6).join(' ') + (words.length > 6 ? '...' : '');
  };

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
            <CustomerInfoDisplay
              customerInfo={customerInfo}
              onCustomerClick={customerInfo.isClaimed && canViewFullContent ? handleCustomerNameClick : undefined}
              size="small"
              showContactInfo={canViewFullContent}
            />
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
              <p className="text-gray-700 leading-relaxed">
                {getPreviewText(review.content)}
              </p>
              <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
                <div className="flex items-center text-gray-600 mb-2">
                  <Lock className="h-4 w-4 mr-2" />
                  <span className="text-sm">Full review locked</span>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  Subscribe or purchase one-time access to view the complete review
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleOneTimeAccess}
                    className="flex-1"
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Unlock Review ($3)
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSubscriptionAccess}
                    className="flex-1"
                  >
                    Subscribe for Unlimited Access
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewCard;
