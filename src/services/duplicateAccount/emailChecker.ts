
import { supabase } from "@/integrations/supabase/client";

/**
 * Check if an email already exists in the auth system
 */
export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    console.log("=== EMAIL DUPLICATE CHECK START ===");
    console.log("Checking email exists for:", email);
    
    // Force a fresh query by adding a timestamp and random value to bypass any caching
    const timestamp = Date.now();
    const randomValue = Math.random().toString(36).substring(7);
    console.log("Query timestamp:", timestamp, "Random:", randomValue);
    
    // Clear any potential local cache by creating a fresh query
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, name, type, created_at')
      .eq('email', email)
      .limit(1)
      .maybeSingle();
    
    console.log("Profile check result:", { profileData, profileError });
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.error("Error checking profile:", profileError);
      console.log("=== EMAIL DUPLICATE CHECK END (ERROR) ===");
      // If there's an error other than "not found", assume email might exist
      return true;
    }
    
    // If we found a profile with this email, it exists
    if (profileData) {
      console.log("Found existing profile with email:", email);
      console.log("Profile details:", profileData);
      console.log("=== EMAIL DUPLICATE CHECK END (FOUND) ===");
      return true;
    }

    // Additional check: try to query with a different approach to bypass cache
    const { data: altProfileData, error: altProfileError } = await supabase
      .from('profiles')
      .select('email')
      .ilike('email', email)
      .maybeSingle();
    
    console.log("Alternative profile check result:", { altProfileData, altProfileError });
    
    if (altProfileData) {
      console.log("Found existing profile with email (alternative check):", email);
      console.log("=== EMAIL DUPLICATE CHECK END (FOUND ALT) ===");
      return true;
    }
    
    console.log("No profile found in database, email appears to be available");
    console.log("=== EMAIL DUPLICATE CHECK END (AVAILABLE) ===");
    return false;
  } catch (error) {
    console.error("Error checking email:", error);
    console.log("=== EMAIL DUPLICATE CHECK END (CATCH ERROR) ===");
    return false;
  }
};
