
import { supabase } from "@/integrations/supabase/client";

/**
 * Check if phone number already exists in profiles
 */
export const checkPhoneExists = async (phone: string): Promise<{ exists: boolean; email?: string }> => {
  try {
    const cleanPhone = phone.replace(/\D/g, '');
    
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('phone, email')
      .ilike('phone', `%${cleanPhone.slice(-10)}%`); // Check last 10 digits
    
    if (error) {
      console.error("Error checking phone:", error);
      return { exists: false };
    }
    
    // Check if any profile has this phone number
    const matchingProfile = profiles?.find(profile => {
      const profilePhone = profile.phone?.replace(/\D/g, '') || '';
      return profilePhone.includes(cleanPhone.slice(-10)) || cleanPhone.includes(profilePhone.slice(-10));
    });
    
    return {
      exists: !!matchingProfile,
      email: matchingProfile?.email || undefined
    };
  } catch (error) {
    console.error("Error checking phone:", error);
    return { exists: false };
  }
};
