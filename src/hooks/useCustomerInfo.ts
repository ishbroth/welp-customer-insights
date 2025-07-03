
import { useMemo } from "react";

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

export const useCustomerInfo = (params: CustomerInfoParams) => {
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

    console.log('useCustomerInfo: Processing customer info:', {
      customer_name,
      customerId,
      isClaimed,
      matchScore,
      matchType,
      matchConfidence
    });

    return {
      name: customer_name || 'Unknown Customer',
      phone: customer_phone,
      address: customer_address,
      city: customer_city,
      zipCode: customer_zipcode,
      isClaimed,
      matchConfidence,
      matchScore,
      matchType: isClaimed ? 'claimed' : matchType,
      potentialMatchId: customerId // For navigation purposes
    };
  }, [params]);
};
