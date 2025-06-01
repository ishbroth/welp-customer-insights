
import { Star, ThumbsUp, Laugh, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Review } from "@/types";
import ReviewReactions from "@/components/ReviewReactions";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import { useVerifiedStatus } from "@/hooks/useVerifiedStatus";

interface ReviewCardProps {
  review: Review;
  onReactionToggle?: (reviewId: string, reactionType: string) => void;
  showCustomerInfo?: boolean;
}

const ReviewCard = ({ review, onReactionToggle, showCustomerInfo = true }: ReviewCardProps) => {
  const { isVerified } = useVerifiedStatus(review.reviewerId);

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

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        {/* Reviewer Info */}
        <div className="flex items-start space-x-4 mb-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={review.reviewerAvatar} alt={review.reviewerName} />
            <AvatarFallback className="bg-blue-100 text-blue-800">
              {getInitials(review.reviewerName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg">{review.reviewerName}</h3>
              {isVerified && <VerifiedBadge size="sm" />}
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex">{renderStars(review.rating)}</div>
              <span className="text-sm text-gray-500">
                {formatDate(review.date)}
              </span>
            </div>
          </div>
        </div>

        {/* Review Content */}
        <div className="mb-4">
          <p className="text-gray-700 whitespace-pre-wrap">{review.content}</p>
        </div>

        {/* Customer Info */}
        {showCustomerInfo && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Customer:</strong> {review.customerName}
            </p>
            {(review.address || review.city || review.state || review.zipCode) && (
              <p className="text-sm text-gray-600">
                <strong>Location:</strong> {[review.address, review.city, review.state, review.zipCode].filter(Boolean).join(', ')}
              </p>
            )}
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
