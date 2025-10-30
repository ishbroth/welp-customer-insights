
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ReviewMatchQualityScore from "@/components/customer/ReviewMatchQualityScore";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getNameInitials } from "@/utils/nameFormatter";
import { logger } from '@/utils/logger';

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
  hideMatchScore?: boolean;
  reviewCustomerId?: string; // Optional: pass review's customerId for profile data lookup
}

const CustomerInfoDisplay: React.FC<CustomerInfoDisplayProps> = ({
  customerInfo,
  onCustomerClick,
  size = 'medium',
  showContactInfo = false,
  hideMatchScore = false,
  reviewCustomerId
}) => {
  const componentLogger = logger.withContext('CustomerInfoDisplay');

  // Fetch customer profile data when review is claimed
  const { data: customerProfile } = useQuery({
    queryKey: ['customerProfile', reviewCustomerId],
    queryFn: async () => {
      if (!reviewCustomerId) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('id, avatar, first_name, last_name, name, phone, address, city, state, zipcode')
        .eq('id', reviewCustomerId)
        .maybeSingle();

      if (error) {
        componentLogger.error("Error fetching customer profile:", error);
        return null;
      }

      return data;
    },
    enabled: !!reviewCustomerId && customerInfo.isClaimed
  });

  // Enhanced customer info that uses profile data when available
  const enhancedCustomerInfo = React.useMemo(() => {
    if (!customerProfile || !customerInfo.isClaimed) {
      return customerInfo;
    }

    // Use profile data when available
    const profileName = customerProfile.first_name && customerProfile.last_name 
      ? `${customerProfile.first_name} ${customerProfile.last_name}`
      : customerProfile.first_name || customerProfile.last_name || customerProfile.name;

    return {
      ...customerInfo,
      name: profileName || customerInfo.name,
      avatar: customerProfile.avatar || customerInfo.avatar,
      phone: customerProfile.phone || customerInfo.phone,
      address: customerProfile.address || customerInfo.address,
      city: customerProfile.city || customerInfo.city,
      zipCode: customerProfile.zipcode || customerInfo.zipCode
    };
  }, [customerInfo, customerProfile]);


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
  const isClickable = onCustomerClick && (enhancedCustomerInfo.isClaimed || enhancedCustomerInfo.matchConfidence === 'high');

  return (
    <div className="flex items-center space-x-2">
      <div className="text-left flex-1">
        <div className="flex items-center gap-1">
          {isClickable ? (
            <h4
              className={`${sizeClasses.name} cursor-pointer hover:text-blue-600 transition-colors text-blue-600 hover:underline`}
              onClick={onCustomerClick}
            >
              {enhancedCustomerInfo.name}
            </h4>
          ) : (
            <h4 className={sizeClasses.name}>
              {enhancedCustomerInfo.name}
            </h4>
          )}
        </div>

        {/* Show match quality score for unclaimed reviews */}
        {!hideMatchScore && !enhancedCustomerInfo.isClaimed && enhancedCustomerInfo.matchScore && enhancedCustomerInfo.matchScore > 5 && enhancedCustomerInfo.matchType && (
          <div className="flex mb-1">
            <ReviewMatchQualityScore
              matchScore={enhancedCustomerInfo.matchScore}
              matchType={enhancedCustomerInfo.matchType}
            />
          </div>
        )}

        {showContactInfo && (
          <div className={sizeClasses.details}>
            {enhancedCustomerInfo.isClaimed ? (
              <>
                {enhancedCustomerInfo.phone && <p>{enhancedCustomerInfo.phone}</p>}
                {enhancedCustomerInfo.address && (
                  <p>{[enhancedCustomerInfo.address, enhancedCustomerInfo.city, enhancedCustomerInfo.zipCode].filter(Boolean).join(', ')}</p>
                )}
              </>
            ) : (
              <p className="text-gray-400">Contact info available after claiming</p>
            )}
          </div>
        )}

        <p className={sizeClasses.details}>Customer</p>
      </div>

      <Avatar className={sizeClasses.avatar}>
        {enhancedCustomerInfo.isClaimed && enhancedCustomerInfo.avatar ? (
          <AvatarImage src={enhancedCustomerInfo.avatar} alt={enhancedCustomerInfo.name} />
        ) : null}
        <AvatarFallback className="bg-gray-100 text-gray-600">
          {getNameInitials(enhancedCustomerInfo.name)}
        </AvatarFallback>
      </Avatar>
    </div>
  );
};

export default CustomerInfoDisplay;
