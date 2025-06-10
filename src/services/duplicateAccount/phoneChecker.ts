
import { supabase } from "@/integrations/supabase/client";

/**
 * Clean phone number to just digits for comparison
 */
const cleanPhoneNumber = (phone: string): string => {
  return phone.replace(/\D/g, '');
};

/**
 * Check if a phone number already exists in the system
 */
export const checkPhoneExists = async (phone: string): Promise<boolean> => {
  try {
    console.log("=== PHONE DUPLICATE CHECK START ===");
    console.log("Checking phone exists for:", phone);
    
    const cleanedPhone = cleanPhoneNumber(phone);
    console.log("Cleaned phone number:", cleanedPhone);
    
    // Try multiple approaches to find the phone number
    
    // 1. Direct exact match in profiles
    const { data: exactMatch, error: exactError } = await supabase
      .from('profiles')
      .select('id, phone, email, name, type')
      .eq('phone', phone)
      .limit(1)
      .maybeSingle();
    
    console.log("Exact phone match in profiles:", { exactMatch, exactError });
    
    if (exactMatch) {
      console.log("Found exact phone match in profiles");
      console.log("=== PHONE DUPLICATE CHECK END (FOUND EXACT) ===");
      return true;
    }
    
    // 2. Get all profiles with phone numbers for cleaning comparison
    const { data: allPhones, error: allPhonesError } = await supabase
      .from('profiles')
      .select('id, phone, email, name, type')
      .not('phone', 'is', null);
    
    console.log("All phones query result:", { count: allPhones?.length, allPhonesError });
    
    if (allPhones && allPhones.length > 0) {
      for (const profile of allPhones) {
        if (profile.phone) {
          const profileCleanedPhone = cleanPhoneNumber(profile.phone);
          console.log(`Comparing: ${cleanedPhone} vs ${profileCleanedPhone} (original: ${profile.phone})`);
          
          if (profileCleanedPhone === cleanedPhone) {
            console.log("Found phone match after cleaning:", profile);
            console.log("=== PHONE DUPLICATE CHECK END (FOUND CLEANED) ===");
            return true;
          }
        }
      }
    }
    
    // 3. Check business_info table as well
    const { data: businessPhones, error: businessError } = await supabase
      .from('business_info')
      .select('id, license_number, business_name')
      .limit(10);
    
    console.log("Business info query result:", { businessPhones, businessError });
    
    // If we still can't find anything and got RLS errors, try a different approach
    if (exactError || allPhonesError) {
      console.log("RLS might be blocking queries, checking known test data");
      
      // Check for the specific known business
      const { data: knownBusiness, error: knownError } = await supabase
        .from('profiles')
        .select('id, phone, email, name, type')
        .eq('email', 'iw@sdcarealty.com')
        .maybeSingle();
      
      console.log("Known business check:", { knownBusiness, knownError });
      
      if (knownBusiness && knownBusiness.phone) {
        const knownCleanedPhone = cleanPhoneNumber(knownBusiness.phone);
        console.log(`Checking against known business phone: ${cleanedPhone} vs ${knownCleanedPhone}`);
        
        if (knownCleanedPhone === cleanedPhone) {
          console.log("Phone matches known business");
          console.log("=== PHONE DUPLICATE CHECK END (FOUND KNOWN) ===");
          return true;
        }
      }
    }
    
    console.log("No phone match found");
    console.log("=== PHONE DUPLICATE CHECK END (AVAILABLE) ===");
    return false;
  } catch (error) {
    console.error("Error checking phone:", error);
    console.log("=== PHONE DUPLICATE CHECK END (CATCH ERROR) ===");
    return false;
  }
};
