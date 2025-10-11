
import { useMemo } from "react";
import { logger } from '@/utils/logger';

const hookLogger = logger.withContext('CustomerInfo');

interface CustomerInfoParams {
  customer_name?: string;
  customer_phone?: string;
  customer_address?: string;
  customer_city?: string;
  customer_zipcode?: string;
  customerId?: string;
  matchScore?: number;
  matchType?: 'high_quality' | 'potential' | 'claimed';
}

interface CustomerProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  avatar?: string;
  phone?: string;
}

export const useCustomerInfo = (
  params: CustomerInfoParams, 
  customerProfile?: CustomerProfile | null
) => {
  return useMemo(() => {
    const {
      customer_name = '',
      customer_phone = '',
      customer_address = '',
      customer_city = '',
      customer_zipcode = '',
      customerId,
      matchScore = 0,
      matchType = 'potential'
    } = params;

    // FIXED: Only consider review claimed if customerId exists in database
    const isClaimed = !!customerId;
    
    // For unclaimed reviews, determine match confidence based on score
    let matchConfidence: 'high' | 'medium' | 'low' = 'low';
    if (matchScore >= 85) {
      matchConfidence = 'high';
    } else if (matchScore >= 70) {
      matchConfidence = 'medium';
    }

    // Use actual customer profile data if review is claimed and profile exists
    const displayName = isClaimed && customerProfile 
      ? customerProfile.name || `${customerProfile.first_name || ''} ${customerProfile.last_name || ''}`.trim()
      : customer_name || 'Unknown Customer';

    const displayPhone = isClaimed && customerProfile?.phone 
      ? customerProfile.phone 
      : customer_phone;

    hookLogger.debug('Processing customer info:', {
      customer_name,
      customerId,
      isClaimed,
      matchScore,
      matchType,
      matchConfidence,
      customerProfile: customerProfile ? 'found' : 'not found',
      displayName
    });

    return {
      name: displayName,
      phone: displayPhone,
      address: customer_address,
      city: customer_city,
      zipCode: customer_zipcode,
      isClaimed,
      matchConfidence,
      matchScore,
      matchType: isClaimed ? 'claimed' : matchType,
      potentialMatchId: customerId, // For navigation purposes
      avatar: isClaimed && customerProfile?.avatar ? customerProfile.avatar : ''
    };
  }, [params, customerProfile]);
};
