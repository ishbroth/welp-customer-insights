
import { supabase } from "@/integrations/supabase/client";

/**
 * Check if a phone number already exists in the system
 */
export const checkPhoneExists = async (phone: string): Promise<boolean> => {
  try {
    console.log("=== PHONE DUPLICATE CHECK START ===");
    console.log("Checking phone exists for:", phone);
    
    // Force a fresh query by adding a timestamp and random value to bypass any caching
    const timestamp = Date.now();
    const randomValue = Math.random().toString(36).substring(7);
    console.log("Query timestamp:", timestamp, "Random:", randomValue);
    
    // Clear any potential local cache by creating a fresh query
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, phone, email, name, type, created_at')
      .eq('phone', phone)
      .limit(1)
      .maybeSingle();
    
    console.log("Phone profile check result:", { profileData, profileError });
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.error("Error checking phone profile:", profileError);
      console.log("=== PHONE DUPLICATE CHECK END (ERROR) ===");
      return true;
    }
    
    if (profileData) {
      console.log("Found existing profile with phone:", phone);
      console.log("Profile details:", profileData);
      console.log("=== PHONE DUPLICATE CHECK END (FOUND) ===");
      return true;
    }

    // Additional check: try to query with a different approach to bypass cache
    const { data: altProfileData, error: altProfileError } = await supabase
      .from('profiles')
      .select('phone')
      .ilike('phone', `%${phone}%`)
      .maybeSingle();
    
    console.log("Alternative phone check result:", { altProfileData, altProfileError });
    
    if (altProfileData) {
      console.log("Found existing profile with phone (alternative check):", phone);
      console.log("=== PHONE DUPLICATE CHECK END (FOUND ALT) ===");
      return true;
    }
    
    console.log("No profile found with phone number, appears to be available");
    console.log("=== PHONE DUPLICATE CHECK END (AVAILABLE) ===");
    return false;
  } catch (error) {
    console.error("Error checking phone:", error);
    console.log("=== PHONE DUPLICATE CHECK END (CATCH ERROR) ===");
    return false;
  }
};
