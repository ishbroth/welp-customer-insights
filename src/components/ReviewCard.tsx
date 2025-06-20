
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Review } from "@/types";
import ReviewReactions from "@/components/ReviewReactions";
import VerifiedBadge from "@/components/ui/VerifiedBadge";

interface ReviewCardProps {
  review: Review;
  onReactionToggle?: (reviewId: string, reactionType: string) => void;
  showCustomerInfo?: boolean;
  viewerType?: "business" | "customer";
}

const ReviewCard = ({ 
  review, 
  onReactionToggle, 
  showCustomerInfo = true,
  viewerType = "business"
}: ReviewCardProps) => {
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
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  // Determine left and right side content based on viewer type
  const isBusinessViewer = viewerType === "business";
  
  const leftSideInfo = isBusinessViewer ? {
    name: review.customerName,
    avatar: review.customerAvatar,
    initials: getInitials(review.customerName),
    type: "Customer"
  } : {
    name: review.reviewerName,
    avatar: review.reviewerAvatar,
    initials: getInitials(review.reviewerName),
    type: "Business",
    verified: review.reviewerVerified
  };

  const rightSideInfo = isBusinessViewer ? {
    name: review.reviewerName,
    avatar: review.reviewerAvatar,
    initials: getInitials(review.reviewerName),
    type: "Business",
    verified: review.reviewerVerified
  } : {
    name: review.customerName,
    avatar: review.customerAvatar,
    initials: getInitials(review.customerName),
    type: "Customer"
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        {/* Header with both business and customer info */}
        <div className="flex items-start justify-between mb-4">
          {/* Left side - larger */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={leftSideInfo.avatar} alt={leftSideInfo.name} />
              <AvatarFallback className="bg-blue-100 text-blue-800">
                {leftSideInfo.initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">{leftSideInfo.name}</h3>
                {leftSideInfo.verified && <VerifiedBadge size="sm" />}
              </div>
              <p className="text-sm text-gray-500">{leftSideInfo.type}</p>
            </div>
          </div>

          {/* Right side - smaller */}
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={rightSideInfo.avatar} alt={rightSideInfo.name} />
              <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                {rightSideInfo.initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-1">
                <h4 className="font-medium text-sm">{rightSideInfo.name}</h4>
                {rightSideInfo.verified && <VerifiedBadge size="xs" />}
              </div>
              <p className="text-xs text-gray-500">{rightSideInfo.type}</p>
            </div>
          </div>
        </div>

        {/* Rating and date */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex">{renderStars(review.rating)}</div>
          <span className="text-sm text-gray-500">
            {formatDate(review.date)}
          </span>
        </div>

        {/* Review Content */}
        <div className="mb-4">
          <p className="text-gray-700 whitespace-pre-wrap">{review.content}</p>
        </div>

        {/* Customer Address Info (only show if customer is on the left side) */}
        {isBusinessViewer && showCustomerInfo && (review.address || review.city || review.zipCode) && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Customer Address:</strong> {[review.address, review.city, review.zipCode].filter(Boolean).join(', ')}
            </p>
          </div>
        )}

        {/* Reactions */}
        {onReactionToggle && (
          <ReviewReactions
            reviewId={review.id}
            customerId={review.customerId}
            businessId={review.reviewerId}
            businessName={review.reviewerName}
            businessAvatar={review.reviewerAvatar}
            reactions={review.reactions}
            onReactionToggle={onReactionToggle}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ReviewCard;
