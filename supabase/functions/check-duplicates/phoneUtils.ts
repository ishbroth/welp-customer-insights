
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Profile, DuplicateCheckResponse } from './types.ts'

export const checkPhoneDuplicates = async (
  supabaseAdmin: any,
  phone: string,
  accountType: string
): Promise<DuplicateCheckResponse | null> => {
  const cleanedPhone = phone.replace(/\D/g, '');
  console.log("Checking phone:", phone, "cleaned:", cleanedPhone, "for account type:", accountType);

  // Get profiles with phones filtered by the SPECIFIC account type only
  const { data: profilesForAccountType, error: profilesError } = await supabaseAdmin
    .from('profiles')
    .select('id, phone, email, name, type, address')
    .eq('type', accountType)  // Only check within the same account type
    .not('phone', 'is', null);

  console.log(`Profiles with phones for account type ${accountType}:`, profilesForAccountType?.length, profilesError);

  if (profilesForAccountType) {
    for (const profile of profilesForAccountType) {
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

  console.log(`No phone duplicates found within account type: ${accountType}`);
  return null;
};
