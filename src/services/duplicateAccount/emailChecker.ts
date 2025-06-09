
import { supabase } from "@/integrations/supabase/client";

/**
 * Check if an email already exists in the auth system
 */
export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    // First check if there's a profile with this email in our profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.error("Error checking profile:", profileError);
      // If there's an error other than "not found", assume email might exist
      return true;
    }
    
    // If we found a profile with this email, it exists
    if (profileData) {
      return true;
    }
    
    // As a fallback, try the password reset method
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
    
    // For other errors, assume email might exist to be safe
    return true;
  } catch (error) {
    console.error("Error checking email:", error);
    return false;
  }
};
