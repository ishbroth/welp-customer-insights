
import React, { useState } from "react";
import StarRating from "@/components/StarRating";
import { formatDistance } from "date-fns";
import { Button } from "@/components/ui/button";
import { MessageSquare, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { Review } from "@/types";
import CustomerReviewResponse from "@/components/customer/CustomerReviewResponse";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import VerifiedBadge from "@/components/ui/VerifiedBadge";

interface ReviewCardProps {
  review: Review;
  hasSubscription: boolean;
  isOneTimeUnlocked: boolean;
  onResponseSubmitted?: (response: any) => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  hasSubscription,
  isOneTimeUnlocked,
  onResponseSubmitted,
}) => {
  const { currentUser } = useAuth();
  const [showResponses, setShowResponses] = useState(false);
  const [responses, setResponses] = useState<any[]>([]);

  const getInitials = (name: string) => {
    if (name) {
      const names = name.split(' ');
      return names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return "U";
  };

  const handleToggleResponses = () => {
    setShowResponses(!showResponses);
  };

  // For search results, always show customer on left, business on right
  const customerInfo = {
    name: review.customerName,
    avatar: review.customerAvatar,
    initials: getInitials(review.customerName)
  };

  const businessInfo = {
    name: review.reviewerName,
    avatar: review.reviewerAvatar,
    initials: getInitials(review.reviewerName),
    verified: review.reviewerVerified
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      {/* Header with customer on left, business on right */}
      <div className="flex items-start justify-between mb-4">
        {/* Customer info - left side (larger) */}
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={customerInfo.avatar} alt={customerInfo.name} />
            <AvatarFallback className="bg-blue-100 text-blue-800">
              {customerInfo.initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-lg">{customerInfo.name}</h3>
            <p className="text-sm text-gray-500">Customer</p>
          </div>
        </div>

        {/* Business info - right side (smaller) */}
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={businessInfo.avatar} alt={businessInfo.name} />
            <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
              {businessInfo.initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-1">
              <h4 className="font-medium text-sm">{businessInfo.name}</h4>
              {businessInfo.verified && <VerifiedBadge size="xs" />}
            </div>
            <p className="text-xs text-gray-500">Business</p>
          </div>
        </div>
      </div>

      {/* Rating and date */}
      <div className="flex items-center mb-2">
        <StarRating rating={review.rating} />
        <span className="ml-2 text-sm text-gray-500">
          {formatDistance(new Date(review.date), new Date(), {
            addSuffix: true,
          })}
        </span>
      </div>

      {/* Review content */}
      <p className="text-gray-700 mb-4">{review.content}</p>

      {/* Customer address info */}
      {(review.address || review.city || review.zipCode) && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Customer Address:</strong> {[review.address, review.city, review.zipCode].filter(Boolean).join(', ')}
          </p>
        </div>
      )}
      
      {showResponses && (
        <CustomerReviewResponse 
          reviewId={review.id}
          responses={responses}
          hasSubscription={hasSubscription}
          isOneTimeUnlocked={isOneTimeUnlocked}
          hideReplyOption={false}
          reviewAuthorId={review.reviewerId}
          onResponseSubmitted={(response) => {
            setResponses(prev => [...prev, response]);
            if (onResponseSubmitted) {
              onResponseSubmitted(response);
            }
          }}
        />
      )}
    </div>
  );
};

export default ReviewCard;
