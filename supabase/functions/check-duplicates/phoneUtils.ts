
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Profile, DuplicateCheckResponse } from './types.ts'

export const checkPhoneDuplicates = async (
  supabaseAdmin: any,
  phone: string,
  accountType: string
): Promise<DuplicateCheckResponse | null> => {
  const cleanedPhone = phone.replace(/\D/g, '');
  console.log("Checking phone:", phone, "cleaned:", cleanedPhone, "for account type:", accountType);

  // Get all profiles with phones of the same account type
  const { data: allProfiles, error: profilesError } = await supabaseAdmin
    .from('profiles')
    .select('id, phone, email, name, type, address')
    .eq('type', accountType)
    .not('phone', 'is', null);

  console.log("All profiles with phones for account type:", accountType, allProfiles?.length, profilesError);

  if (allProfiles) {
    for (const profile of allProfiles) {
      if (profile.phone) {
        const profileCleanedPhone = profile.phone.replace(/\D/g, '');
        console.log(`Comparing: ${cleanedPhone} vs ${profileCleanedPhone} (account type: ${accountType})`);
        
        if (profileCleanedPhone === cleanedPhone) {
          console.log("Found phone match:", profile);
          return {
            isDuplicate: true,
            duplicateType: 'phone',
            existingPhone: phone,
            existingEmail: profile.email,
            allowContinue: false
          };
        }
      }
    }
  }

  return null;
};
