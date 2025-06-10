
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
    
    // First, let's check authentication status
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log("Current authenticated user:", user?.id, "Auth error:", authError);
    
    // Check if we can query profiles at all with a simple count
    const { count: profileCount, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    console.log("Total profiles count:", profileCount, "Count error:", countError);
    
    // Try querying profiles without any RLS restrictions by using service role if possible
    const { data: allProfiles, error: allError } = await supabase
      .from('profiles')
      .select('id, phone, email, name, type, created_at')
      .limit(10);
    
    console.log("Sample profiles:", allProfiles);
    console.log("Profiles query error:", allError);
    
    // If we have no profiles at all, something is fundamentally wrong
    if (!allProfiles || allProfiles.length === 0) {
      console.log("WARNING: No profiles found in database - this suggests data issue or RLS blocking access");
      
      // Try a different approach - check if the specific email exists first
      const { data: emailCheck, error: emailError } = await supabase
        .from('profiles')
        .select('id, email, phone, name')
        .eq('email', 'iw@sdcarealty.com')
        .maybeSingle();
      
      console.log("Direct email check for iw@sdcarealty.com:", emailCheck, "Error:", emailError);
      
      // If email check also fails, we have a deeper issue
      if (!emailCheck) {
        console.log("CRITICAL: Known business email not found - data may have been deleted or RLS is blocking access");
        console.log("=== PHONE DUPLICATE CHECK END (DATA ISSUE) ===");
        return false;
      }
    }
    
    // Now do the actual phone checks
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
    
    // Check for cleaned phone matches
    if (cleanedPhone.length >= 10) {
      const { data: allPhoneProfiles, error: phoneError } = await supabase
        .from('profiles')
        .select('id, phone, email, name, type, created_at')
        .not('phone', 'is', null);
      
      console.log("All profiles with phone numbers:", allPhoneProfiles);
      console.log("Phone profiles error:", phoneError);
      
      if (allPhoneProfiles && allPhoneProfiles.length > 0) {
        // Check each phone number by cleaning it
        for (const profile of allPhoneProfiles) {
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
      } else {
        console.log("No profiles with phone numbers found");
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
