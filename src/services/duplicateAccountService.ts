
import { supabase } from "@/integrations/supabase/client";

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  duplicateType: 'email' | 'phone' | 'both' | 'business_name' | null;
  existingEmail?: string;
  existingPhone?: string;
  allowContinue?: boolean; // New field to control continue option
}

/**
 * Check if an email already exists in the auth system
 */
export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    // Try to send a password reset to see if email exists
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password",
    });
    
    // If no error, email exists in auth system
    if (!error) {
      return true;
    }
    
    // Check for specific error messages that indicate email exists
    if (error.message.includes("User not found") || 
        error.message.includes("Unable to validate email address")) {
      return false;
    }
    
    // For other errors, assume email might exist
    return true;
  } catch (error) {
    console.error("Error checking email:", error);
    return false;
  }
};

/**
 * Check if phone number already exists in profiles
 */
export const checkPhoneExists = async (phone: string): Promise<{ exists: boolean; email?: string }> => {
  try {
    const cleanPhone = phone.replace(/\D/g, '');
    
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('phone, email')
      .ilike('phone', `%${cleanPhone.slice(-10)}%`); // Check last 10 digits
    
    if (error) {
      console.error("Error checking phone:", error);
      return { exists: false };
    }
    
    // Check if any profile has this phone number
    const matchingProfile = profiles?.find(profile => {
      const profilePhone = profile.phone?.replace(/\D/g, '') || '';
      return profilePhone.includes(cleanPhone.slice(-10)) || cleanPhone.includes(profilePhone.slice(-10));
    });
    
    return {
      exists: !!matchingProfile,
      email: matchingProfile?.email || undefined
    };
  } catch (error) {
    console.error("Error checking phone:", error);
    return { exists: false };
  }
};

/**
 * Check if business name already exists
 */
export const checkBusinessNameExists = async (businessName: string): Promise<boolean> => {
  try {
    const { data: businesses, error } = await supabase
      .from('business_info')
      .select('business_name')
      .ilike('business_name', businessName);
    
    if (error) {
      console.error("Error checking business name:", error);
      return false;
    }
    
    return businesses && businesses.length > 0;
  } catch (error) {
    console.error("Error checking business name:", error);
    return false;
  }
};

/**
 * Comprehensive duplicate account check
 */
export const checkForDuplicateAccount = async (
  email: string, 
  phone: string,
  businessName?: string
): Promise<DuplicateCheckResult> => {
  const checks = await Promise.all([
    checkEmailExists(email),
    checkPhoneExists(phone),
    businessName ? checkBusinessNameExists(businessName) : Promise.resolve(false)
  ]);
  
  const [emailExists, phoneResult, businessNameExists] = checks;
  
  // Priority order: email/phone duplicates (no continue), then business name (allow continue)
  if (emailExists && phoneResult.exists) {
    return {
      isDuplicate: true,
      duplicateType: 'both',
      existingEmail: email,
      existingPhone: phone,
      allowContinue: false
    };
  }
  
  if (emailExists) {
    return {
      isDuplicate: true,
      duplicateType: 'email',
      existingEmail: email,
      allowContinue: false
    };
  }
  
  if (phoneResult.exists) {
    return {
      isDuplicate: true,
      duplicateType: 'phone',
      existingPhone: phone,
      existingEmail: phoneResult.email,
      allowContinue: false
    };
  }
  
  if (businessNameExists) {
    return {
      isDuplicate: true,
      duplicateType: 'business_name',
      allowContinue: true
    };
  }
  
  return {
    isDuplicate: false,
    duplicateType: null,
    allowContinue: false
  };
};
