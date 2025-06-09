
import { supabase } from "@/integrations/supabase/client";

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  duplicateType: 'email' | 'phone' | 'both' | 'business_name' | 'customer_name' | null;
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
 * Check if business name AND phone exist together
 */
export const checkBusinessNameAndPhoneExists = async (businessName: string, phone: string): Promise<{ exists: boolean; email?: string }> => {
  try {
    const cleanPhone = phone.replace(/\D/g, '');
    
    // First get all profiles with similar phone numbers
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, phone, email')
      .ilike('phone', `%${cleanPhone.slice(-10)}%`);
    
    if (profileError || !profiles?.length) {
      return { exists: false };
    }
    
    // Get matching profile by phone
    const matchingProfile = profiles.find(profile => {
      const profilePhone = profile.phone?.replace(/\D/g, '') || '';
      return profilePhone.includes(cleanPhone.slice(-10)) || cleanPhone.includes(profilePhone.slice(-10));
    });
    
    if (!matchingProfile) {
      return { exists: false };
    }
    
    // Now check if this profile also has a matching business name
    const { data: businessInfo, error: businessError } = await supabase
      .from('business_info')
      .select('business_name')
      .eq('id', matchingProfile.id)
      .ilike('business_name', businessName);
    
    if (businessError || !businessInfo?.length) {
      return { exists: false };
    }
    
    return {
      exists: true,
      email: matchingProfile.email || undefined
    };
  } catch (error) {
    console.error("Error checking business name and phone:", error);
    return { exists: false };
  }
};

/**
 * Check if customer name AND phone exist together
 */
export const checkCustomerNameAndPhoneExists = async (firstName: string, lastName: string, phone: string): Promise<{ exists: boolean; email?: string }> => {
  try {
    const fullName = `${firstName} ${lastName}`.trim();
    if (!fullName) return { exists: false };
    
    const cleanPhone = phone.replace(/\D/g, '');
    
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('first_name, last_name, name, phone, email')
      .eq('type', 'customer')
      .ilike('phone', `%${cleanPhone.slice(-10)}%`);
    
    if (error || !profiles?.length) {
      return { exists: false };
    }
    
    // Check if any profile has both matching name and phone
    const matchingProfile = profiles.find(profile => {
      const profilePhone = profile.phone?.replace(/\D/g, '') || '';
      const phoneMatches = profilePhone.includes(cleanPhone.slice(-10)) || cleanPhone.includes(profilePhone.slice(-10));
      
      if (!phoneMatches) return false;
      
      const profileFullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
      const profileName = profile.name?.trim() || '';
      const nameMatches = profileFullName.toLowerCase() === fullName.toLowerCase() || 
                         profileName.toLowerCase() === fullName.toLowerCase();
      
      return nameMatches;
    });
    
    return {
      exists: !!matchingProfile,
      email: matchingProfile?.email || undefined
    };
  } catch (error) {
    console.error("Error checking customer name and phone:", error);
    return { exists: false };
  }
};

/**
 * Comprehensive duplicate account check for business accounts
 * Only shows popup if name AND phone both match existing accounts
 */
export const checkForDuplicateAccount = async (
  email: string, 
  phone: string,
  businessName?: string
): Promise<DuplicateCheckResult> => {
  // First check for email duplicates (always block these)
  const emailExists = await checkEmailExists(email);
  if (emailExists) {
    return {
      isDuplicate: true,
      duplicateType: 'email',
      existingEmail: email,
      allowContinue: false
    };
  }
  
  // If business name is provided, check for business name + phone combination
  if (businessName) {
    const businessNameAndPhoneResult = await checkBusinessNameAndPhoneExists(businessName, phone);
    if (businessNameAndPhoneResult.exists) {
      return {
        isDuplicate: true,
        duplicateType: 'business_name',
        existingPhone: phone,
        existingEmail: businessNameAndPhoneResult.email,
        allowContinue: true // Allow continue for business name matches
      };
    }
  }
  
  return {
    isDuplicate: false,
    duplicateType: null,
    allowContinue: false
  };
};

/**
 * Comprehensive duplicate account check for customer accounts
 * Only shows popup if name AND phone both match existing accounts
 */
export const checkForDuplicateCustomerAccount = async (
  email: string, 
  phone: string,
  firstName?: string,
  lastName?: string
): Promise<DuplicateCheckResult> => {
  // First check for email duplicates (always block these)
  const emailExists = await checkEmailExists(email);
  if (emailExists) {
    return {
      isDuplicate: true,
      duplicateType: 'email',
      existingEmail: email,
      allowContinue: false
    };
  }
  
  // If customer name is provided, check for customer name + phone combination
  if (firstName && lastName) {
    const customerNameAndPhoneResult = await checkCustomerNameAndPhoneExists(firstName, lastName, phone);
    if (customerNameAndPhoneResult.exists) {
      return {
        isDuplicate: true,
        duplicateType: 'customer_name',
        existingPhone: phone,
        existingEmail: customerNameAndPhoneResult.email,
        allowContinue: true // Allow continue for customer name matches
      };
    }
  }
  
  return {
    isDuplicate: false,
    duplicateType: null,
    allowContinue: false
  };
};
