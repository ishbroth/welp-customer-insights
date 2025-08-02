
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import VerifiedBadge from "@/components/ui/VerifiedBadge";

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
  onCustomerClick: () => void;
}

const CustomerReviewCardHeader: React.FC<CustomerReviewCardHeaderProps> = ({
  businessInfo,
  customerInfo,
  reviewDate,
  shouldBusinessNameBeClickable,
  onBusinessNameClick,
  onCustomerClick,
}) => {
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

  return (
    <div className="flex items-start justify-between w-full">
      {/* Customer side (left) */}
      <div className="flex items-center space-x-3">
        <Avatar 
          className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={onCustomerClick}
        >
          {customerInfo.isClaimed ? (
            <AvatarImage src={customerInfo.avatar} alt={customerInfo.name} />
          ) : null}
          <AvatarFallback className="bg-gray-100 text-gray-600">
            {getInitials(customerInfo.name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <h3 
              className="font-semibold cursor-pointer hover:text-blue-600 transition-colors"
              onClick={onCustomerClick}
            >
              {customerInfo.name}
            </h3>
            {/* Only show verified badge for customers if the review is claimed */}
            {customerInfo.isClaimed && <VerifiedBadge size="sm" />}
          </div>
          <p className="text-sm text-gray-500">
            {formatDate(reviewDate)}
          </p>
        </div>
      </div>

      {/* Business side (right) */}
      <div className="flex items-center space-x-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={businessInfo.avatar} alt={businessInfo.name} />
          <AvatarFallback className="bg-blue-100 text-blue-800 text-xs">
            {getInitials(businessInfo.name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <h4 
              className={`font-medium text-sm ${shouldBusinessNameBeClickable ? 'cursor-pointer hover:text-blue-600 transition-colors' : ''}`}
              onClick={shouldBusinessNameBeClickable ? onBusinessNameClick : undefined}
            >
              {businessInfo.name}
            </h4>
            {businessInfo.verified && <VerifiedBadge size="xs" />}
          </div>
          <p className="text-xs text-gray-500">Business</p>
        </div>
      </div>
    </div>
  );
};

export default CustomerReviewCardHeader;
