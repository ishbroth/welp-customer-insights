
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import ReviewCustomerAvatar from "./ReviewCustomerAvatar";
import { getBusinessInitials } from "./enhancedReviewCardUtils";

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
}) => {
  return (
    <div className="flex justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            {finalBusinessAvatar ? (
              <AvatarImage src={finalBusinessAvatar} alt={reviewerName} />
            ) : (
              <AvatarFallback className="bg-blue-100 text-blue-800">
                {getBusinessInitials(reviewerName)}
              </AvatarFallback>
            )}
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
              {isVerified && <VerifiedBadge size="sm" />}
            </div>
            <p className="text-sm text-gray-500">
              {new Date(date).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
      
      <ReviewCustomerAvatar
        customerName={customerName}
        customerAvatar={finalCustomerAvatar}
        displayPhone={displayPhone}
        isReviewClaimed={isReviewClaimed}
      />
    </div>
  );
};

export default EnhancedReviewHeader;
