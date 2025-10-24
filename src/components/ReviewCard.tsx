
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Review } from "@/types";
import ReviewReactions from "@/components/ReviewReactions";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileShareButton from "@/components/mobile/MobileShareButton";
import AssociatesDisplay from "@/components/reviews/AssociatesDisplay";
import { getReviewerDisplayName } from "@/utils/anonymousReviewUtils";
import { getInitials } from "@/utils/stringUtils";
import { formatDate } from "@/utils/dateUtils";

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
  const isMobile = useIsMobile();

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
    name: getReviewerDisplayName(
      review.is_anonymous || false,
      review.reviewerName,
      review.reviewerBusinessCategory
    ),
    avatar: review.reviewerAvatar,
    initials: getInitials(review.reviewerName),
    type: "Business",
    verified: review.reviewerVerified
  };

  const rightSideInfo = isBusinessViewer ? {
    name: getReviewerDisplayName(
      review.is_anonymous || false,
      review.reviewerName,
      review.reviewerBusinessCategory
    ),
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
      <CardContent className={`${isMobile ? "p-4" : "p-6"}`}>
        {/* Header with both business and customer info */}
        <div className={`${isMobile ? "flex-col space-y-3 mb-3" : "flex items-start justify-between mb-4"}`}>
          {/* Left side - larger */}
          <div className={`flex items-center ${isMobile ? "space-x-3" : "space-x-4"}`}>
            <Avatar className={`${isMobile ? "h-14 w-14" : "h-12 w-12"}`}>
              <AvatarImage src={leftSideInfo.avatar} alt={leftSideInfo.name} />
              <AvatarFallback className="bg-blue-100 text-blue-800">
                {leftSideInfo.initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`font-semibold ${isMobile ? "text-lg" : "text-lg"}`}>{leftSideInfo.name}</h3>
                {leftSideInfo.verified && <VerifiedBadge size={isMobile ? "sm" : "sm"} />}
              </div>
              <p className={`text-gray-500 ${isMobile ? "text-sm" : "text-sm"}`}>{leftSideInfo.type}</p>
            </div>
          </div>

          {/* Right side - smaller */}
          <div className={`flex items-center ${isMobile ? "space-x-3 pl-17" : "space-x-2"}`}>
            <Avatar className={`${isMobile ? "h-10 w-10" : "h-8 w-8"}`}>
              <AvatarImage src={rightSideInfo.avatar} alt={rightSideInfo.name} />
              <AvatarFallback className={`bg-gray-100 text-gray-600 ${isMobile ? "text-sm" : "text-xs"}`}>
                {rightSideInfo.initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-1">
                <h4 className={`font-medium ${isMobile ? "text-sm" : "text-sm"}`}>{rightSideInfo.name}</h4>
                {rightSideInfo.verified && <VerifiedBadge size={isMobile ? "xs" : "xs"} />}
              </div>
              <p className={`text-gray-500 ${isMobile ? "text-xs" : "text-xs"}`}>{rightSideInfo.type}</p>
            </div>
          </div>
        </div>

        {/* Rating and date */}
        <div className={`flex items-center gap-2 ${isMobile ? "mb-3" : "mb-2"}`}>
          <div className="flex">{renderStars(review.rating)}</div>
          <span className={`text-gray-500 ${isMobile ? "text-sm" : "text-sm"}`}>
            {formatDate(review.date, "MMMM d, yyyy")}
          </span>
        </div>

        {/* Review Content */}
        <div className={`${isMobile ? "mb-3" : "mb-4"}`}>
          <p className={`text-gray-700 whitespace-pre-wrap ${isMobile ? "text-sm leading-relaxed" : "text-base"}`}>
            {review.content}
          </p>
        </div>

        {/* Associates Display - show when associates exist OR business name exists */}
        {((review.associates && review.associates.length > 0) || review.customer_business_name) && (
          <AssociatesDisplay
            associates={review.associates}
            businessName={review.customer_business_name}
            reviewData={{
              phone: (review as any).customer_phone || (review as any).phone || (review as any).customerPhone || '',
              address: review.address || '',
              city: review.city || '',
              state: (review as any).customer_state || (review as any).customerState || (review as any).state || '',
              zipCode: review.zipCode || ''
            }}
          />
        )}

        {/* Customer Address Info (only show if customer is on the left side) */}
        {isBusinessViewer && showCustomerInfo && (review.address || review.city || review.zipCode) && (
          <div className={`bg-gray-50 rounded-lg ${isMobile ? "mb-3 p-3" : "mb-4 p-3"}`}>
            <p className={`text-gray-600 ${isMobile ? "text-sm" : "text-sm"}`}>
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

        {/* Mobile Share Button */}
        {isMobile && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <MobileShareButton
              title={`Review by ${leftSideInfo.name}`}
              text={`${review.rating} star review: ${review.content}`}
              size="sm"
              variant="ghost"
              className="w-full justify-center"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReviewCard;
