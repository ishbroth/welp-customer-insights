
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { Star, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import VerifiedBadge from "@/components/ui/VerifiedBadge";

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
              {review.customerId && canViewFullContent ? (
                <h4 
                  className="font-medium cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={handleCustomerNameClick}
                >
                  {review.customerName}
                </h4>
              ) : (
                <h4 className="font-medium">
                  {review.customerName}
                </h4>
              )}
            </div>
            <p className="text-sm text-gray-500">Customer</p>
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

        {/* Address (if available and unlocked) */}
        {canViewFullContent && (review.address || review.city) && (
          <div className="text-sm text-gray-600 mb-4">
            <strong>Service Address:</strong>{' '}
            {[review.address, review.city, review.state].filter(Boolean).join(', ')}
            {review.zipCode && ` ${review.zipCode}`}
          </div>
        )}

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
