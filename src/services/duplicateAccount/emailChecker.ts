
import { supabase } from "@/integrations/supabase/client";

/**
 * Check if an email already exists in the auth system
 */
export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    console.log("Checking email exists for:", email);
    
    // First check if there's a profile with this email in our profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .maybeSingle();
    
    console.log("Profile check result:", { profileData, profileError });
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.error("Error checking profile:", profileError);
      // If there's an error other than "not found", assume email might exist
      return true;
    }
    
    // If we found a profile with this email, it exists
    if (profileData) {
      console.log("Found existing profile with email:", email);
      return true;
    }
    
    console.log("No profile found, checking auth system...");
    
    // As a fallback, try the password reset method
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password",
    });
    
    console.log("Auth reset password result:", { error });
    
    // If no error, email exists in auth system
    if (!error) {
      console.log("Email exists in auth system:", email);
      return true;
    }
    
    // Check for specific error messages that indicate email exists
    if (error.message.includes("User not found") || 
        error.message.includes("Unable to validate email address")) {
      console.log("Email confirmed not to exist:", email);
      return false;
    }
    
    console.log("Other auth error, assuming email might exist:", error.message);
    // For other errors, assume email might exist to be safe
    return true;
  } catch (error) {
    console.error("Error checking email:", error);
    return false;
  }
};
