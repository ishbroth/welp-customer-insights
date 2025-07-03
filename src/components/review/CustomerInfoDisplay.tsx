
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import { Badge } from "@/components/ui/badge";
import { CustomerInfo } from "@/utils/customerInfoMerger";

interface CustomerInfoDisplayProps {
  customerInfo: CustomerInfo;
  onCustomerClick?: () => void;
  size?: 'small' | 'medium';
  showContactInfo?: boolean;
}

const CustomerInfoDisplay: React.FC<CustomerInfoDisplayProps> = ({
  customerInfo,
  onCustomerClick,
  size = 'medium',
  showContactInfo = true
}) => {
  const getInitials = (name: string) => {
    const names = name.split(' ');
    return names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatAddress = () => {
    const parts = [];
    if (customerInfo.address) parts.push(customerInfo.address);
    if (customerInfo.city) parts.push(customerInfo.city);
    if (customerInfo.state) parts.push(customerInfo.state);
    if (customerInfo.zipCode) parts.push(customerInfo.zipCode);
    return parts.join(', ');
  };

  const getMatchConfidenceBadge = () => {
    if (customerInfo.isClaimed) return null;
    
    switch (customerInfo.matchConfidence) {
      case 'high':
        return <Badge variant="secondary" className="text-xs">Likely Match</Badge>;
      case 'potential':
        return <Badge variant="outline" className="text-xs">Possible Match</Badge>;
      default:
        return null;
    }
  };

  const avatarSize = size === 'small' ? 'h-8 w-8' : 'h-10 w-10';
  const nameSize = size === 'small' ? 'text-sm' : 'font-semibold';
  const detailSize = size === 'small' ? 'text-xs' : 'text-sm';

  // Only allow clicking if claimed or high confidence match
  const isClickable = customerInfo.isClaimed || customerInfo.matchConfidence === 'high';
  const clickHandler = isClickable ? onCustomerClick : undefined;

  return (
    <div className="flex items-center space-x-2">
      <Avatar 
        className={`${avatarSize} ${clickHandler ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
        onClick={clickHandler}
      >
        {customerInfo.avatar ? (
          <AvatarImage src={customerInfo.avatar} alt={customerInfo.name} />
        ) : (
          <AvatarFallback className="bg-gray-100 text-gray-600">
            {getInitials(customerInfo.name)}
          </AvatarFallback>
        )}
      </Avatar>
      <div>
        <div className="flex items-center gap-1 flex-wrap">
          <h4 
            className={`${nameSize} ${clickHandler ? 'cursor-pointer hover:text-blue-600 transition-colors' : ''}`}
            onClick={clickHandler}
          >
            {customerInfo.name}
          </h4>
          {customerInfo.isVerified && <VerifiedBadge size={size === 'small' ? 'xs' : 'sm'} />}
          {customerInfo.isClaimed ? (
            <span className={`${detailSize} text-green-600 font-medium`}>Claimed</span>
          ) : (
            <span className={`${detailSize} text-gray-500`}>Unclaimed</span>
          )}
          {getMatchConfidenceBadge()}
        </div>
        <p className={`${detailSize} text-gray-500`}>Customer</p>
        
        {showContactInfo && (
          <div className={`${detailSize} text-gray-600 space-y-1 mt-1`}>
            {customerInfo.phone && (
              <div>📞 {customerInfo.phone}</div>
            )}
            {formatAddress() && (
              <div>📍 {formatAddress()}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerInfoDisplay;
