
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
    
    // Check all profiles to see what data exists
    const { data: allProfiles, error: allError } = await supabase
      .from('profiles')
      .select('*')
      .limit(50);
    
    console.log("All profiles (first 50):", allProfiles);
    console.log("Profiles query error:", allError);
    
    // Specifically look for profiles with any phone field populated
    const profilesWithPhone = allProfiles?.filter(p => p.phone) || [];
    console.log("Profiles with phone field populated:", profilesWithPhone);
    
    // Also check business_info table for phone numbers
    const { data: businessInfo, error: businessError } = await supabase
      .from('business_info')
      .select('*')
      .limit(50);
    
    console.log("All business_info records:", businessInfo);
    console.log("Business info query error:", businessError);
    
    // Look for the specific business we know exists
    const { data: specificBusiness, error: specificError } = await supabase
      .from('profiles')
      .select('*')
      .ilike('email', '%iw@sdcarealty.com%');
    
    console.log("Specific business search (iw@sdcarealty.com):", specificBusiness);
    console.log("Specific business error:", specificError);
    
    // Also search by business name
    const { data: namedBusiness, error: namedError } = await supabase
      .from('profiles')
      .select('*')
      .ilike('name', '%Painted Painter%');
    
    console.log("Business by name search (Painted Painter):", namedBusiness);
    console.log("Named business error:", namedError);
    
    // Check for exact match first in profiles
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
    
    // If no exact match, search by cleaned digits in profiles
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
