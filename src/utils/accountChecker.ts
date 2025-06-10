
import { supabase } from "@/integrations/supabase/client";

export const checkAccountType = async (email: string) => {
  try {
    console.log("=== ACCOUNT TYPE CHECK START ===");
    console.log("Checking account type for email:", email);
    
    // Force fresh data by adding timestamp
    const timestamp = Date.now();
    console.log("Query timestamp:", timestamp);
    
    // Check profiles table with fresh query
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, type, name, phone, created_at')
      .eq('email', email)
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
