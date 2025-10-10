import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import { getNameInitials } from "@/utils/nameFormatter";

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
  isAnonymous?: boolean;
}

const CustomerReviewCardHeader: React.FC<CustomerReviewCardHeaderProps> = ({
  businessInfo,
  customerInfo,
  reviewDate,
  isAnonymous = false,
  shouldBusinessNameBeClickable,
  onBusinessNameClick,
  onCustomerClick,
}) => {


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const truncateBusinessName = (name: string, maxLength: number = 10) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + '...';
  };

  return (
    <div className="w-full">
      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className="flex items-start justify-between w-full">
          {/* Customer side (left) - takes most space */}
          <div className="flex items-center space-x-3 flex-1">
            <Avatar 
              className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={onCustomerClick}
            >
              {customerInfo.isClaimed ? (
                <AvatarImage src={customerInfo.avatar} alt={customerInfo.name} />
              ) : null}
              <AvatarFallback className="bg-gray-100 text-gray-600">
                {getNameInitials(customerInfo.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 
                  className="font-semibold cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={onCustomerClick}
                >
                  {customerInfo.name}
                </h3>
                {customerInfo.isClaimed && <VerifiedBadge size="sm" />}
              </div>
              <p className="text-sm text-gray-500">
                {formatDate(reviewDate)}
              </p>
            </div>
          </div>

          {/* Business side (right) - smaller and compact */}
          <div className="flex items-center space-x-1 ml-2">
            <Avatar className="h-6 w-6">
              {!isAnonymous && <AvatarImage src={businessInfo.avatar} alt={businessInfo.name} />}
              <AvatarFallback className={isAnonymous ? "bg-purple-100 text-purple-800 text-sm" : "bg-blue-100 text-blue-800 text-xs"}>
                {isAnonymous ? "🕵️" : getNameInitials(businessInfo.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1">
                <h4 
                  className={`font-medium text-xs ${shouldBusinessNameBeClickable ? 'cursor-pointer hover:text-blue-600 transition-colors' : ''}`}
                  onClick={shouldBusinessNameBeClickable ? onBusinessNameClick : undefined}
                  title={businessInfo.name}
                >
                  {truncateBusinessName(businessInfo.name)}
                </h4>
                {businessInfo.verified && <VerifiedBadge size="xs" />}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout - unchanged */}
      <div className="hidden md:flex items-start justify-between w-full">
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
            {getNameInitials(customerInfo.name)}
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
            {!isAnonymous && <AvatarImage src={businessInfo.avatar} alt={businessInfo.name} />}
            <AvatarFallback className={isAnonymous ? "bg-purple-100 text-purple-800 text-base" : "bg-blue-100 text-blue-800 text-xs"}>
              {isAnonymous ? "🕵️" : getNameInitials(businessInfo.name)}
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
    </div>
  );
};

export default CustomerReviewCardHeader;
