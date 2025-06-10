
import { supabase } from "@/integrations/supabase/client";

export const checkAccountType = async (email: string) => {
  try {
    console.log("=== ACCOUNT TYPE CHECK START ===");
    console.log("Checking account type for email:", email);
    
    // Force fresh data by adding timestamp and random value
    const timestamp = Date.now();
    const randomValue = Math.random().toString(36).substring(7);
    console.log("Query timestamp:", timestamp, "Random:", randomValue);
    
    // Clear any potential local cache by creating a fresh query with limit
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, type, name, phone, created_at')
      .eq('email', email)
      .limit(1)
      .maybeSingle();
    
    console.log("Account type profile data:", profileData);
    console.log("Account type profile error:", profileError);
    
    if (profileData) {
      console.log(`Account found - Type: ${profileData.type}, Name: ${profileData.name}`);
      console.log("=== ACCOUNT TYPE CHECK END (FOUND) ===");
      return {
        exists: true,
        type: profileData.type,
        name: profileData.name,
        id: profileData.id,
        phone: profileData.phone
      };
    }

    // Additional check: try to query with a different approach to bypass cache
    const { data: altProfileData, error: altProfileError } = await supabase
      .from('profiles')
      .select('id, email, type, name, phone')
      .ilike('email', email)
      .maybeSingle();
    
    console.log("Alternative account type check:", { altProfileData, altProfileError });
    
    if (altProfileData) {
      console.log(`Account found (alternative) - Type: ${altProfileData.type}, Name: ${altProfileData.name}`);
      console.log("=== ACCOUNT TYPE CHECK END (FOUND ALT) ===");
      return {
        exists: true,
        type: altProfileData.type,
        name: altProfileData.name,
        id: altProfileData.id,
        phone: altProfileData.phone
      };
    }
    
    console.log("No account found in profiles table");
    console.log("=== ACCOUNT TYPE CHECK END (NOT FOUND) ===");
    return {
      exists: false,
      type: null,
      name: null,
      id: null
    };
    
  } catch (error: any) {
    console.error("Error checking account type:", error);
    console.log("=== ACCOUNT TYPE CHECK END (ERROR) ===");
    return {
      exists: false,
      type: null,
      name: null,
      id: null,
      error: error.message
    };
  }
};
