
import { supabase } from "@/integrations/supabase/client";

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  duplicateType: 'email' | 'phone' | 'both' | null;
  existingEmail?: string;
  existingPhone?: string;
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
 * Comprehensive duplicate account check
 */
export const checkForDuplicateAccount = async (
  email: string, 
  phone: string
): Promise<DuplicateCheckResult> => {
  const [emailExists, phoneResult] = await Promise.all([
    checkEmailExists(email),
    checkPhoneExists(phone)
  ]);
  
  if (emailExists && phoneResult.exists) {
    return {
      isDuplicate: true,
      duplicateType: 'both',
      existingEmail: email,
      existingPhone: phone
    };
  }
  
  if (emailExists) {
    return {
      isDuplicate: true,
      duplicateType: 'email',
      existingEmail: email
    };
  }
  
  if (phoneResult.exists) {
    return {
      isDuplicate: true,
      duplicateType: 'phone',
      existingPhone: phone,
      existingEmail: phoneResult.email
    };
  }
  
  return {
    isDuplicate: false,
    duplicateType: null
  };
};
