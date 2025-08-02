
import React from "react";
import { Phone } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getBusinessInitials, getCustomerInitials } from "./enhancedReviewCardUtils";
import VerifiedBadge from "@/components/ui/VerifiedBadge";

interface EnhancedReviewHeaderProps {
  reviewerName: string;
  date: string;
  finalBusinessAvatar: string;
  isBusinessVerified: boolean;
  isUnlocked: boolean;
  onBusinessNameClick: () => void;
  customerName?: string;
  finalCustomerAvatar: string;
  displayPhone?: string;
  isReviewClaimed: boolean;
  isCustomerVerified: boolean;
}

const EnhancedReviewHeader: React.FC<EnhancedReviewHeaderProps> = ({
  reviewerName,
  date,
  finalBusinessAvatar,
  isBusinessVerified,
  isUnlocked,
  onBusinessNameClick,
  customerName,
  finalCustomerAvatar,
  displayPhone,
  isReviewClaimed,
  isCustomerVerified,
}) => {
  console.log('EnhancedReviewHeader: Rendering with data:', {
    reviewerName,
    customerName,
    finalBusinessAvatar,
    finalCustomerAvatar,
    isBusinessVerified,
    isCustomerVerified,
    isReviewClaimed
  });

  return (
    <div className="flex justify-between mb-4">
      {/* Customer Avatar - show on the left */}
      {customerName && (
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            {isReviewClaimed && finalCustomerAvatar ? (
              <AvatarImage src={finalCustomerAvatar} alt={customerName} />
            ) : (
              <AvatarFallback className="bg-gray-100 text-gray-600">
                {getCustomerInitials(customerName)}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">{customerName}</span>
              {/* Show verified badge next to customer name if claimed and verified */}
              {isReviewClaimed && isCustomerVerified && <VerifiedBadge size="sm" />}
            </div>
            {displayPhone && (
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-3 w-3 mr-1" />
                {displayPhone}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Business Avatar - show on the right */}
      <div className="flex items-center space-x-2">
        <div className="text-right">
          <div className="text-sm text-gray-500">
            {new Date(date).toLocaleDateString()}
          </div>
          <div className="text-xs text-gray-400">Reviewed by:</div>
        </div>
        <Avatar className="h-8 w-8">
          <AvatarImage src={finalBusinessAvatar} alt={reviewerName} />
          <AvatarFallback className="bg-blue-100 text-blue-800 text-xs">
            {getBusinessInitials(reviewerName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex items-center gap-2">
          {isUnlocked ? (
            <span 
              className="text-sm font-medium cursor-pointer text-blue-600 hover:text-blue-800 hover:underline transition-colors"
              onClick={onBusinessNameClick}
            >
              {reviewerName}
            </span>
          ) : (
            <span className="text-sm font-medium">{reviewerName}</span>
          )}
          {/* Show verified badge next to business name if verified */}
          {isBusinessVerified && <VerifiedBadge size="sm" />}
        </div>
      </div>
    </div>
  );
};

export default EnhancedReviewHeader;
