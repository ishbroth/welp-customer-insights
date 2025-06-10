
import { supabase } from "@/integrations/supabase/client";

interface BusinessAddressCheckResult {
  exists: boolean;
  email?: string;
}

/**
 * Check if a business name + address combination already exists
 */
export const checkBusinessNameAndAddressExists = async (
  businessName: string, 
  address: string
): Promise<BusinessAddressCheckResult> => {
  try {
    console.log("=== BUSINESS NAME + ADDRESS DUPLICATE CHECK START ===");
    console.log("Checking business name + address combination:", { businessName, address });
    
    // Force a fresh query by adding a timestamp and random value to bypass any caching
    const timestamp = Date.now();
    const randomValue = Math.random().toString(36).substring(7);
    console.log("Query timestamp:", timestamp, "Random:", randomValue);
    
    // Clear any potential local cache by creating a fresh query
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, name, address, email, type, created_at')
      .eq('type', 'business')
      .ilike('name', `%${businessName}%`)
      .eq('address', address)
      .limit(1)
      .maybeSingle();
    
    console.log("Business name + address profile check result:", { profileData, profileError });
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.error("Error checking business name + address profile:", profileError);
      console.log("=== BUSINESS NAME + ADDRESS DUPLICATE CHECK END (ERROR) ===");
      return { exists: true };
    }
    
    if (profileData) {
      console.log("Found existing business with name + address:", { businessName, address });
      console.log("Profile details:", profileData);
      console.log("=== BUSINESS NAME + ADDRESS DUPLICATE CHECK END (FOUND) ===");
      return { 
        exists: true, 
        email: profileData.email 
      };
    }

    console.log("No business found with name + address combination");
    console.log("=== BUSINESS NAME + ADDRESS DUPLICATE CHECK END (AVAILABLE) ===");
    return { exists: false };
  } catch (error) {
    console.error("Error checking business name + address:", error);
    console.log("=== BUSINESS NAME + ADDRESS DUPLICATE CHECK END (CATCH ERROR) ===");
    return { exists: false };
  }
};
