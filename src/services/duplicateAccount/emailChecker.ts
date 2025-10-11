import { logger } from '@/utils/logger';

import { supabase } from "@/integrations/supabase/client";

const serviceLogger = logger.withContext('EmailChecker');

/**
 * Check if an email already exists in business accounts only
 */
export const checkEmailExistsInBusinessAccounts = async (email: string): Promise<boolean> => {
  try {
    serviceLogger.debug("=== BUSINESS EMAIL DUPLICATE CHECK START ===");
    serviceLogger.debug("Checking email exists in business accounts for:", email);
    
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, name, type, created_at')
      .eq('email', email)
      .eq('type', 'business')
      .limit(1)
      .maybeSingle();

    serviceLogger.debug("Business profile check result:", { profileData, profileError });

    if (profileData) {
      serviceLogger.debug("Found existing business profile with email:", email);
      serviceLogger.debug("=== BUSINESS EMAIL DUPLICATE CHECK END (FOUND) ===");
      return true;
    }
    
    serviceLogger.debug("No business email found");
    serviceLogger.debug("=== BUSINESS EMAIL DUPLICATE CHECK END (AVAILABLE) ===");
    return false;
  } catch (error) {
    serviceLogger.error("Error checking business email:", error);
    serviceLogger.debug("=== BUSINESS EMAIL DUPLICATE CHECK END (CATCH ERROR) ===");
    return false;
  }
};

/**
 * Check if an email already exists in customer accounts only
 */
export const checkEmailExistsInCustomerAccounts = async (email: string): Promise<boolean> => {
  try {
    serviceLogger.debug("=== CUSTOMER EMAIL DUPLICATE CHECK START ===");
    serviceLogger.debug("Checking email exists in customer accounts for:", email);
    
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, name, type, created_at')
      .eq('email', email)
      .eq('type', 'customer')
      .limit(1)
      .maybeSingle();

    serviceLogger.debug("Customer profile check result:", { profileData, profileError });

    if (profileData) {
      serviceLogger.debug("Found existing customer profile with email:", email);
      serviceLogger.debug("=== CUSTOMER EMAIL DUPLICATE CHECK END (FOUND) ===");
      return true;
    }
    
    serviceLogger.debug("No customer email found");
    serviceLogger.debug("=== CUSTOMER EMAIL DUPLICATE CHECK END (AVAILABLE) ===");
    return false;
  } catch (error) {
    serviceLogger.error("Error checking customer email:", error);
    serviceLogger.debug("=== CUSTOMER EMAIL DUPLICATE CHECK END (CATCH ERROR) ===");
    return false;
  }
};

/**
 * Check if an email already exists in the auth system (legacy function for backward compatibility)
 */
export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    serviceLogger.debug("=== LEGACY EMAIL DUPLICATE CHECK START ===");
    serviceLogger.debug("Checking email exists for:", email);
    
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, name, type, created_at')
      .eq('email', email)
      .limit(1)
      .maybeSingle();

    serviceLogger.debug("Profile check result:", { profileData, profileError });

    if (profileData) {
      serviceLogger.debug("Found existing profile with email:", email);
      serviceLogger.debug("=== LEGACY EMAIL DUPLICATE CHECK END (FOUND) ===");
      return true;
    }
    
    serviceLogger.debug("No email found in any system");
    serviceLogger.debug("=== LEGACY EMAIL DUPLICATE CHECK END (AVAILABLE) ===");
    return false;
  } catch (error) {
    serviceLogger.error("Error checking email:", error);
    serviceLogger.debug("=== LEGACY EMAIL DUPLICATE CHECK END (CATCH ERROR) ===");
    return false;
  }
};
