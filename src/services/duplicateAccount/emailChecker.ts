
import { supabase } from "@/integrations/supabase/client";

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
