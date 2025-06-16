
import React from "react";
import { Phone } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getCustomerInitials } from "./enhancedReviewCardUtils";

interface ReviewCustomerAvatarProps {
  customerName?: string;
  customerAvatar: string;
  displayPhone?: string;
  isReviewClaimed?: boolean;
}

const ReviewCustomerAvatar: React.FC<ReviewCustomerAvatarProps> = ({
  customerName,
  customerAvatar,
  displayPhone,
  isReviewClaimed = false,
}) => {
  if (!customerName) return null;

  return (
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
        {isReviewClaimed && customerAvatar ? (
          <AvatarImage src={customerAvatar} alt={customerName} />
        ) : (
          <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
            {getCustomerInitials(customerName)}
          </AvatarFallback>
        )}
      </Avatar>
      <span className="text-sm font-medium text-gray-700">{customerName}</span>
    </div>
  );
};

export default ReviewCustomerAvatar;
