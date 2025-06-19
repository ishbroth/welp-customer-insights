
import React from "react";
import { Phone } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getBusinessInitials, getCustomerInitials } from "./enhancedReviewCardUtils";
import VerifiedBadge from "@/components/ui/VerifiedBadge";

interface EnhancedReviewHeaderProps {
  reviewerName: string;
  date: string;
  finalBusinessAvatar: string;
  isVerified: boolean;
  isUnlocked: boolean;
  onBusinessNameClick: () => void;
  customerName?: string;
  finalCustomerAvatar: string;
  displayPhone?: string;
  isReviewClaimed: boolean;
  customerIsVerified?: boolean;
}

const EnhancedReviewHeader: React.FC<EnhancedReviewHeaderProps> = ({
  reviewerName,
  date,
  finalBusinessAvatar,
  isVerified,
  isUnlocked,
  onBusinessNameClick,
  customerName,
  finalCustomerAvatar,
  displayPhone,
  isReviewClaimed,
  customerIsVerified = false,
}) => {
  return (
    <div className="flex justify-between mb-4">
      <div className="flex items-center space-x-3">
        {/* Business Avatar */}
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={finalBusinessAvatar} alt={reviewerName} />
            <AvatarFallback className="bg-blue-100 text-blue-800">
              {getBusinessInitials(reviewerName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              {isUnlocked ? (
                <h3 
                  className="font-semibold cursor-pointer text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                  onClick={onBusinessNameClick}
                >
                  {reviewerName}
                </h3>
              ) : (
                <h3 className="font-semibold">{reviewerName}</h3>
              )}
              {/* Show verified badge next to business name if verified */}
              {isVerified && <VerifiedBadge size="sm" />}
            </div>
            <p className="text-sm text-gray-500">
              {new Date(date).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
      
      {/* Customer Avatar - show on the right */}
      {customerName && (
        <div className="flex items-center space-x-2">
          <div className="text-right">
            <div className="text-sm text-gray-500">About:</div>
            {displayPhone && (
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-3 w-3 mr-1" />
                {displayPhone}
              </div>
            )}
          </div>
          <Avatar className="h-8 w-8">
            {isReviewClaimed && finalCustomerAvatar ? (
              <AvatarImage src={finalCustomerAvatar} alt={customerName} />
            ) : (
              <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                {getCustomerInitials(customerName)}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">{customerName}</span>
            {/* Show verified badge next to customer name if claimed and verified */}
            {isReviewClaimed && customerIsVerified && <VerifiedBadge size="sm" />}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedReviewHeader;
