
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Profile, DuplicateCheckResponse } from './types.ts'

export const checkPhoneDuplicates = async (
  supabaseAdmin: any,
  phone: string,
  accountType: string
): Promise<DuplicateCheckResponse | null> => {
  const cleanedPhone = phone.replace(/\D/g, '');
  console.log("📱=== PHONE DUPLICATE CHECK DEBUG ===");
  console.log("📱 Input phone:", phone);
  console.log("📱 Cleaned phone:", cleanedPhone);
  console.log("📱 Account type:", accountType);

  // First, let's check if there are ANY profiles at all
  console.log("📱 Checking ALL profiles in database...");
  const { data: allProfiles, error: allError } = await supabaseAdmin
    .from('profiles')
    .select('id, phone, email, name, type, address')
    .limit(100);

  console.log("📱 ALL PROFILES COUNT:", allProfiles?.length || 0);
  console.log("📱 ALL PROFILES ERROR:", allError);
  if (allProfiles && allProfiles.length > 0) {
    console.log("📱 SAMPLE PROFILES:", allProfiles.slice(0, 3));
  }

  // Check specifically for profiles with phones
  console.log("📱 Checking profiles with phones...");
  const { data: profilesWithPhones, error: phonesError } = await supabaseAdmin
    .from('profiles')
    .select('id, phone, email, name, type, address')
    .not('phone', 'is', null)
    .neq('phone', '');

  console.log("📱 PROFILES WITH PHONES COUNT:", profilesWithPhones?.length || 0);
  console.log("📱 PROFILES WITH PHONES ERROR:", phonesError);
  if (profilesWithPhones && profilesWithPhones.length > 0) {
    console.log("📱 PROFILES WITH PHONES:", profilesWithPhones);
  }

  // Get profiles filtered by the SPECIFIC account type only
  console.log(`📱 Checking profiles for account type: ${accountType}...`);
  const { data: profilesForAccountType, error: profilesError } = await supabaseAdmin
    .from('profiles')
    .select('id, phone, email, name, type, address')
    .eq('type', accountType)
    .not('phone', 'is', null)
    .neq('phone', '');

  console.log(`📱 PROFILES FOR ACCOUNT TYPE ${accountType} COUNT:`, profilesForAccountType?.length || 0);
  console.log(`📱 PROFILES FOR ACCOUNT TYPE ${accountType} ERROR:`, profilesError);
  if (profilesForAccountType && profilesForAccountType.length > 0) {
    console.log(`📱 PROFILES FOR ACCOUNT TYPE ${accountType}:`, profilesForAccountType);
  }

  if (profilesForAccountType && profilesForAccountType.length > 0) {
    for (const profile of profilesForAccountType) {
      if (profile.phone) {
        const profileCleanedPhone = profile.phone.replace(/\D/g, '');
        console.log(`📱 Comparing phones: input="${cleanedPhone}" vs stored="${profileCleanedPhone}"`);
        console.log(`📱 Profile details:`, profile);
        
        if (profileCleanedPhone === cleanedPhone) {
          console.log("🚨📱 PHONE MATCH FOUND - DUPLICATE DETECTED!");
          console.log("🚨📱 Matching profile:", profile);
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

  console.log(`✅📱 No phone duplicates found within account type: ${accountType}`);
  console.log("📱=== PHONE DUPLICATE CHECK DEBUG END ===");
  return null;
};
