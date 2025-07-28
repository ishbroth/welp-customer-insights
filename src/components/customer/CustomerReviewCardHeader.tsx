
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import { getBusinessInitials, getCustomerInitials } from "./enhancedReviewCardUtils";

interface BusinessInfo {
  name: string;
  avatar: string;
  verified: boolean;
}

interface CustomerInfo {
  name: string;
  avatar: string;
  isClaimed: boolean;
}

interface CustomerReviewCardHeaderProps {
  businessInfo: BusinessInfo;
  customerInfo: CustomerInfo;
  reviewDate: string;
  shouldBusinessNameBeClickable: boolean;
  onBusinessNameClick: () => void;
  onCustomerClick?: () => void;
}

const CustomerReviewCardHeader: React.FC<CustomerReviewCardHeaderProps> = ({
  businessInfo,
  customerInfo,
  reviewDate,
  shouldBusinessNameBeClickable,
  onBusinessNameClick,
  onCustomerClick,
}) => {
  return (
    <div className="flex items-center space-x-3 flex-1">
      {/* Business Avatar */}
      <Avatar className="h-10 w-10">
        <AvatarImage src={businessInfo.avatar} alt={businessInfo.name} />
        <AvatarFallback className="bg-blue-100 text-blue-800">
          {getBusinessInitials(businessInfo.name)}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <div className="flex items-center gap-2">
          {shouldBusinessNameBeClickable ? (
            <h3 
              className="font-semibold cursor-pointer text-blue-600 hover:text-blue-800 hover:underline transition-colors"
              onClick={onBusinessNameClick}
            >
              {businessInfo.name}
            </h3>
          ) : (
            <h3 className="font-semibold">{businessInfo.name}</h3>
          )}
          {businessInfo.verified && <VerifiedBadge size="sm" />}
        </div>
        <p className="text-sm text-gray-500">
          {new Date(reviewDate).toLocaleDateString()}
        </p>
      </div>
      
      {/* Customer info on the right */}
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-500">About:</span>
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={customerInfo.avatar} alt={customerInfo.name} />
            <AvatarFallback className="bg-green-100 text-green-800 text-xs">
              {getCustomerInitials(customerInfo.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-1">
            {onCustomerClick ? (
              <button
                onClick={onCustomerClick}
                className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
              >
                {customerInfo.name}
              </button>
            ) : (
              <span className="text-sm font-medium">{customerInfo.name}</span>
            )}
            {customerInfo.isClaimed && <VerifiedBadge size="sm" />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerReviewCardHeader;
