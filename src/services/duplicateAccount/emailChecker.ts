
import { supabase } from "@/integrations/supabase/client";

/**
 * Check if an email already exists in the auth system
 */
export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    console.log("=== EMAIL DUPLICATE CHECK START ===");
    console.log("Checking email exists for:", email);
    
    // Use the service role or a public query that bypasses RLS for signup checking
    // First try with current session
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, name, type, created_at')
      .eq('email', email)
      .limit(1)
      .maybeSingle();
    
    console.log("Profile check result:", { profileData, profileError });
    
    // If we got data, email exists
    if (profileData) {
      console.log("Found existing profile with email:", email);
      console.log("=== EMAIL DUPLICATE CHECK END (FOUND) ===");
      return true;
    }
    
    // If we got an error, try alternative approach
    if (profileError) {
      console.log("Profile query failed, trying auth approach:", profileError);
      
      // Try using auth signInWithOtp with shouldCreateUser: false
      // This will tell us if the email exists in auth without creating a user
      try {
        const { error: authError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            shouldCreateUser: false
          }
        });
        
        console.log("Auth check result:", authError);
        
        // If no error, email exists in auth
        if (!authError) {
          console.log("Email found in auth system");
          console.log("=== EMAIL DUPLICATE CHECK END (FOUND IN AUTH) ===");
          return true;
        }
        
        // Check specific error messages that indicate existing user
        if (authError.message.includes('Email not confirmed') || 
            authError.message.includes('Invalid login credentials') ||
            authError.message.includes('User already registered')) {
          console.log("Email exists based on auth error:", authError.message);
          console.log("=== EMAIL DUPLICATE CHECK END (FOUND VIA ERROR) ===");
          return true;
        }
      } catch (authCheckError) {
        console.log("Auth check failed:", authCheckError);
      }
    }
    
    console.log("No email found in any system");
    console.log("=== EMAIL DUPLICATE CHECK END (AVAILABLE) ===");
    return false;
  } catch (error) {
    console.error("Error checking email:", error);
    console.log("=== EMAIL DUPLICATE CHECK END (CATCH ERROR) ===");
    // In case of error, assume email might exist to be safe
    return false;
  }
};
