import { logger } from '@/utils/logger';

import { supabase } from "@/integrations/supabase/client";

const serviceLogger = logger.withContext('BusinessChecker');

/**
 * Check if business name AND phone exist together
 */
export const checkBusinessNameAndPhoneExists = async (businessName: string, phone: string): Promise<{ exists: boolean; email?: string }> => {
  try {
    const cleanPhone = phone.replace(/\D/g, '');
    
    // First get all profiles with similar phone numbers
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, phone, email')
      .ilike('phone', `%${cleanPhone.slice(-10)}%`);
    
    if (profileError || !profiles?.length) {
      return { exists: false };
    }
    
    // Get matching profile by phone
    const matchingProfile = profiles.find(profile => {
      const profilePhone = profile.phone?.replace(/\D/g, '') || '';
      return profilePhone.includes(cleanPhone.slice(-10)) || cleanPhone.includes(profilePhone.slice(-10));
    });
    
    if (!matchingProfile) {
      return { exists: false };
    }
    
    // Now check if this profile also has a matching business name
    const { data: businessInfo, error: businessError } = await supabase
      .from('business_info')
      .select('business_name')
      .eq('id', matchingProfile.id)
      .ilike('business_name', businessName);
    
    if (businessError || !businessInfo?.length) {
      return { exists: false };
    }
    
    return {
      exists: true,
      email: matchingProfile.email || undefined
    };
  } catch (error) {
    serviceLogger.error("Error checking business name and phone:", error);
    return { exists: false };
  }
};
