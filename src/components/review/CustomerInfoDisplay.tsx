
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ReviewMatchQualityScore from "@/components/customer/ReviewMatchQualityScore";

interface CustomerInfo {
  name: string;
  phone?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  avatar?: string;
  isClaimed: boolean;
  matchConfidence?: 'high' | 'medium' | 'low';
  matchScore?: number;
  matchType?: 'high_quality' | 'potential' | 'claimed';
  potentialMatchId?: string;
}

interface CustomerInfoDisplayProps {
  customerInfo: CustomerInfo;
  onCustomerClick?: () => void;
  size?: 'small' | 'medium' | 'large';
  showContactInfo?: boolean;
}

const CustomerInfoDisplay: React.FC<CustomerInfoDisplayProps> = ({
  customerInfo,
  onCustomerClick,
  size = 'medium',
  showContactInfo = false
}) => {
  const getInitials = (name: string) => {
    if (name) {
      const names = name.split(' ');
      return names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return "C";
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          avatar: 'h-8 w-8',
          name: 'text-sm font-medium',
          details: 'text-xs text-gray-500'
        };
      case 'large':
        return {
          avatar: 'h-12 w-12',
          name: 'text-lg font-semibold',
          details: 'text-sm text-gray-600'
        };
      default:
        return {
          avatar: 'h-10 w-10',
          name: 'text-base font-medium',
          details: 'text-sm text-gray-500'
        };
    }
  };

  const sizeClasses = getSizeClasses();
  const isClickable = onCustomerClick && (customerInfo.isClaimed || customerInfo.matchConfidence === 'high');

  return (
    <div className="flex items-center space-x-2">
      <Avatar className={sizeClasses.avatar}>
        {customerInfo.isClaimed && customerInfo.avatar ? (
          <AvatarImage src={customerInfo.avatar} alt={customerInfo.name} />
        ) : null}
        <AvatarFallback className="bg-gray-100 text-gray-600">
          {getInitials(customerInfo.name)}
        </AvatarFallback>
      </Avatar>
      
      <div className="text-right">
        <div className="flex items-center gap-1 justify-end">
          {isClickable ? (
            <h4 
              className={`${sizeClasses.name} cursor-pointer hover:text-blue-600 transition-colors text-blue-600 hover:underline`}
              onClick={onCustomerClick}
            >
              {customerInfo.name}
            </h4>
          ) : (
            <h4 className={sizeClasses.name}>
              {customerInfo.name}
            </h4>
          )}
        </div>
        
        {/* Show match quality score for unclaimed reviews */}
        {!customerInfo.isClaimed && customerInfo.matchScore && customerInfo.matchScore > 5 && customerInfo.matchType && (
          <div className="flex justify-end mb-1">
            <ReviewMatchQualityScore 
              matchScore={customerInfo.matchScore}
              matchType={customerInfo.matchType}
            />
          </div>
        )}
        
        {showContactInfo && (
          <div className={sizeClasses.details}>
            {customerInfo.isClaimed ? (
              <>
                {customerInfo.phone && <p>{customerInfo.phone}</p>}
                {customerInfo.address && (
                  <p>{[customerInfo.address, customerInfo.city, customerInfo.zipCode].filter(Boolean).join(', ')}</p>
                )}
              </>
            ) : (
              <p className="text-gray-400">Contact info available after claiming</p>
            )}
          </div>
        )}
        
        <p className={sizeClasses.details}>Customer</p>
      </div>
    </div>
  );
};

export default CustomerInfoDisplay;
