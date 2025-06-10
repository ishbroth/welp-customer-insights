
import { supabase } from "@/integrations/supabase/client";

/**
 * Check if an address already exists in the system
 */
export const checkAddressExists = async (address: string): Promise<boolean> => {
  try {
    console.log("=== ADDRESS DUPLICATE CHECK START ===");
    console.log("Checking address exists for:", address);
    
    // Force a fresh query by adding a timestamp and random value to bypass any caching
    const timestamp = Date.now();
    const randomValue = Math.random().toString(36).substring(7);
    console.log("Query timestamp:", timestamp, "Random:", randomValue);
    
    // Clear any potential local cache by creating a fresh query
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, address, email, name, type, created_at')
      .eq('address', address)
      .limit(1)
      .maybeSingle();
    
    console.log("Address profile check result:", { profileData, profileError });
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.error("Error checking address profile:", profileError);
      console.log("=== ADDRESS DUPLICATE CHECK END (ERROR) ===");
      return true;
    }
    
    if (profileData) {
      console.log("Found existing profile with address:", address);
      console.log("Profile details:", profileData);
      console.log("=== ADDRESS DUPLICATE CHECK END (FOUND) ===");
      return true;
    }

    // Additional check: try to query with a different approach to bypass cache
    const { data: altProfileData, error: altProfileError } = await supabase
      .from('profiles')
      .select('address')
      .ilike('address', `%${address}%`)
      .maybeSingle();
    
    console.log("Alternative address check result:", { altProfileData, altProfileError });
    
    if (altProfileData) {
      console.log("Found existing profile with address (alternative check):", address);
      console.log("=== ADDRESS DUPLICATE CHECK END (FOUND ALT) ===");
      return true;
    }
    
    console.log("No profile found with address, appears to be available");
    console.log("=== ADDRESS DUPLICATE CHECK END (AVAILABLE) ===");
    return false;
  } catch (error) {
    console.error("Error checking address:", error);
    console.log("=== ADDRESS DUPLICATE CHECK END (CATCH ERROR) ===");
    return false;
  }
};
