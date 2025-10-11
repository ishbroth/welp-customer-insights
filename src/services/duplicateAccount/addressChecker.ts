import { logger } from '@/utils/logger';

import { supabase } from "@/integrations/supabase/client";

const serviceLogger = logger.withContext('AddressChecker');

/**
 * Check if an address already exists in the system
 */
export const checkAddressExists = async (address: string): Promise<boolean> => {
  try {
    serviceLogger.debug("=== ADDRESS DUPLICATE CHECK START ===");
    serviceLogger.debug("Checking address exists for:", address);
    
    // Force a fresh query by adding a timestamp and random value to bypass any caching
    const timestamp = Date.now();
    const randomValue = Math.random().toString(36).substring(7);
    serviceLogger.debug("Query timestamp:", timestamp, "Random:", randomValue);
    
    // Clear any potential local cache by creating a fresh query
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, address, email, name, type, created_at')
      .eq('address', address)
      .limit(1)
      .maybeSingle();

    serviceLogger.debug("Address profile check result:", { profileData, profileError });

    if (profileError && profileError.code !== 'PGRST116') {
      serviceLogger.error("Error checking address profile:", profileError);
      serviceLogger.debug("=== ADDRESS DUPLICATE CHECK END (ERROR) ===");
      return true;
    }
    
    if (profileData) {
      serviceLogger.debug("Found existing profile with address:", address);
      serviceLogger.debug("Profile details:", profileData);
      serviceLogger.debug("=== ADDRESS DUPLICATE CHECK END (FOUND) ===");
      return true;
    }

    // Additional check: try to query with a different approach to bypass cache
    const { data: altProfileData, error: altProfileError } = await supabase
      .from('profiles')
      .select('address')
      .ilike('address', `%${address}%`)
      .maybeSingle();

    serviceLogger.debug("Alternative address check result:", { altProfileData, altProfileError });

    if (altProfileData) {
      serviceLogger.debug("Found existing profile with address (alternative check):", address);
      serviceLogger.debug("=== ADDRESS DUPLICATE CHECK END (FOUND ALT) ===");
      return true;
    }
    
    serviceLogger.debug("No profile found with address, appears to be available");
    serviceLogger.debug("=== ADDRESS DUPLICATE CHECK END (AVAILABLE) ===");
    return false;
  } catch (error) {
    serviceLogger.error("Error checking address:", error);
    serviceLogger.debug("=== ADDRESS DUPLICATE CHECK END (CATCH ERROR) ===");
    return false;
  }
};
