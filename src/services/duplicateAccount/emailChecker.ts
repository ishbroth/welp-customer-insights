
import { supabase } from "@/integrations/supabase/client";

/**
 * Check if an email already exists in business accounts only
 */
export const checkEmailExistsInBusinessAccounts = async (email: string): Promise<boolean> => {
  try {
    console.log("=== BUSINESS EMAIL DUPLICATE CHECK START ===");
    console.log("Checking email exists in business accounts for:", email);
    
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, name, type, created_at')
      .eq('email', email)
      .eq('type', 'business')
      .limit(1)
      .maybeSingle();
    
    console.log("Business profile check result:", { profileData, profileError });
    
    if (profileData) {
      console.log("Found existing business profile with email:", email);
      console.log("=== BUSINESS EMAIL DUPLICATE CHECK END (FOUND) ===");
      return true;
    }
    
    console.log("No business email found");
    console.log("=== BUSINESS EMAIL DUPLICATE CHECK END (AVAILABLE) ===");
    return false;
  } catch (error) {
    console.error("Error checking business email:", error);
    console.log("=== BUSINESS EMAIL DUPLICATE CHECK END (CATCH ERROR) ===");
    return false;
  }
};

/**
 * Check if an email already exists in customer accounts only
 */
export const checkEmailExistsInCustomerAccounts = async (email: string): Promise<boolean> => {
  try {
    console.log("=== CUSTOMER EMAIL DUPLICATE CHECK START ===");
    console.log("Checking email exists in customer accounts for:", email);
    
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, name, type, created_at')
      .eq('email', email)
      .eq('type', 'customer')
      .limit(1)
      .maybeSingle();
    
    console.log("Customer profile check result:", { profileData, profileError });
    
    if (profileData) {
      console.log("Found existing customer profile with email:", email);
      console.log("=== CUSTOMER EMAIL DUPLICATE CHECK END (FOUND) ===");
      return true;
    }
    
    console.log("No customer email found");
    console.log("=== CUSTOMER EMAIL DUPLICATE CHECK END (AVAILABLE) ===");
    return false;
  } catch (error) {
    console.error("Error checking customer email:", error);
    console.log("=== CUSTOMER EMAIL DUPLICATE CHECK END (CATCH ERROR) ===");
    return false;
  }
};

/**
 * Check if an email already exists in the auth system (legacy function for backward compatibility)
 */
export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    console.log("=== LEGACY EMAIL DUPLICATE CHECK START ===");
    console.log("Checking email exists for:", email);
    
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, name, type, created_at')
      .eq('email', email)
      .limit(1)
      .maybeSingle();
    
    console.log("Profile check result:", { profileData, profileError });
    
    if (profileData) {
      console.log("Found existing profile with email:", email);
      console.log("=== LEGACY EMAIL DUPLICATE CHECK END (FOUND) ===");
      return true;
    }
    
    console.log("No email found in any system");
    console.log("=== LEGACY EMAIL DUPLICATE CHECK END (AVAILABLE) ===");
    return false;
  } catch (error) {
    console.error("Error checking email:", error);
    console.log("=== LEGACY EMAIL DUPLICATE CHECK END (CATCH ERROR) ===");
    return false;
  }
};
