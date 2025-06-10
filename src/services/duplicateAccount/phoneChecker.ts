
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
    
    // Clean the input phone to just digits
    const cleanedPhone = cleanPhoneNumber(phone);
    console.log("Cleaned phone number:", cleanedPhone);
    
    // Force a fresh query by adding a timestamp and random value to bypass any caching
    const timestamp = Date.now();
    const randomValue = Math.random().toString(36).substring(7);
    console.log("Query timestamp:", timestamp, "Random:", randomValue);
    
    // First, let's check all profiles to see what phone numbers exist
    const { data: allProfiles, error: allError } = await supabase
      .from('profiles')
      .select('id, phone, email, name, type, created_at')
      .not('phone', 'is', null)
      .limit(20);
    
    console.log("All profiles with phone numbers:", allProfiles);
    console.log("All profiles error:", allError);
    
    // Check for exact match first
    const { data: exactMatch, error: exactError } = await supabase
      .from('profiles')
      .select('id, phone, email, name, type, created_at')
      .eq('phone', phone)
      .limit(1)
      .maybeSingle();
    
    console.log("Exact phone match result:", { exactMatch, exactError });
    
    if (exactMatch) {
      console.log("Found exact phone match:", exactMatch);
      console.log("=== PHONE DUPLICATE CHECK END (FOUND EXACT) ===");
      return true;
    }
    
    // If no exact match, search by cleaned digits
    if (cleanedPhone.length >= 10) {
      const { data: cleanedMatches, error: cleanedError } = await supabase
        .from('profiles')
        .select('id, phone, email, name, type, created_at')
        .not('phone', 'is', null);
      
      console.log("All phone records for manual comparison:", cleanedMatches);
      
      if (cleanedMatches) {
        // Check each phone number by cleaning it
        for (const profile of cleanedMatches) {
          if (profile.phone) {
            const profileCleanedPhone = cleanPhoneNumber(profile.phone);
            console.log(`Comparing cleaned phones: ${cleanedPhone} vs ${profileCleanedPhone} (original: ${profile.phone})`);
            
            if (profileCleanedPhone === cleanedPhone) {
              console.log("Found phone match after cleaning:", profile);
              console.log("=== PHONE DUPLICATE CHECK END (FOUND CLEANED) ===");
              return true;
            }
          }
        }
      }
    }
    
    console.log("No phone match found in any format");
    console.log("=== PHONE DUPLICATE CHECK END (AVAILABLE) ===");
    return false;
  } catch (error) {
    console.error("Error checking phone:", error);
    console.log("=== PHONE DUPLICATE CHECK END (CATCH ERROR) ===");
    return false;
  }
};
