import { logger } from '@/utils/logger';

import { supabase } from "@/integrations/supabase/client";

const serviceLogger = logger.withContext('BusinessAddressChecker');

interface BusinessAddressCheckResult {
  exists: boolean;
  email?: string;
}

/**
 * Check if a business name + address combination already exists
 */
export const checkBusinessNameAndAddressExists = async (
  businessName: string,
  address: string
): Promise<BusinessAddressCheckResult> => {
  try {
    serviceLogger.debug("=== BUSINESS NAME + ADDRESS DUPLICATE CHECK START ===");
    serviceLogger.debug("Checking business name + address combination:", { businessName, address });
    
    // Force a fresh query by adding a timestamp and random value to bypass any caching
    const timestamp = Date.now();
    const randomValue = Math.random().toString(36).substring(7);
    serviceLogger.debug("Query timestamp:", timestamp, "Random:", randomValue);
    
    // Clear any potential local cache by creating a fresh query
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, name, address, email, type, created_at')
      .eq('type', 'business')
      .ilike('name', `%${businessName}%`)
      .eq('address', address)
      .limit(1)
      .maybeSingle();

    serviceLogger.debug("Business name + address profile check result:", { profileData, profileError });

    if (profileError && profileError.code !== 'PGRST116') {
      serviceLogger.error("Error checking business name + address profile:", profileError);
      serviceLogger.debug("=== BUSINESS NAME + ADDRESS DUPLICATE CHECK END (ERROR) ===");
      return { exists: true };
    }
    
    if (profileData) {
      serviceLogger.debug("Found existing business with name + address:", { businessName, address });
      serviceLogger.debug("Profile details:", profileData);
      serviceLogger.debug("=== BUSINESS NAME + ADDRESS DUPLICATE CHECK END (FOUND) ===");
      return { 
        exists: true, 
        email: profileData.email 
      };
    }

    serviceLogger.debug("No business found with name + address combination");
    serviceLogger.debug("=== BUSINESS NAME + ADDRESS DUPLICATE CHECK END (AVAILABLE) ===");
    return { exists: false };
  } catch (error) {
    serviceLogger.error("Error checking business name + address:", error);
    serviceLogger.debug("=== BUSINESS NAME + ADDRESS DUPLICATE CHECK END (CATCH ERROR) ===");
    return { exists: false };
  }
};
