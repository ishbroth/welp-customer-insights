
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Profile, DuplicateCheckResponse } from './types.ts'

export const checkPhoneDuplicates = async (
  supabaseAdmin: any,
  phone: string,
  accountType: string
): Promise<DuplicateCheckResponse | null> => {
  const cleanedPhone = phone.replace(/\D/g, '');
  console.log("=== PHONE DUPLICATE CHECK DEBUG ===");
  console.log("Input phone:", phone);
  console.log("Cleaned phone:", cleanedPhone);
  console.log("Account type:", accountType);

  // First, let's check if there are ANY profiles at all
  const { data: allProfiles, error: allError } = await supabaseAdmin
    .from('profiles')
    .select('id, phone, email, name, type, address')
    .limit(10);

  console.log("ALL PROFILES COUNT:", allProfiles?.length || 0);
  console.log("ALL PROFILES ERROR:", allError);
  console.log("ALL PROFILES DATA:", allProfiles);

  // Check specifically for business profiles
  const { data: businessProfiles, error: businessError } = await supabaseAdmin
    .from('profiles')
    .select('id, phone, email, name, type, address')
    .eq('type', 'business')
    .not('phone', 'is', null);

  console.log("BUSINESS PROFILES COUNT:", businessProfiles?.length || 0);
  console.log("BUSINESS PROFILES ERROR:", businessError);
  console.log("BUSINESS PROFILES DATA:", businessProfiles);

  // Check specifically for customer profiles
  const { data: customerProfiles, error: customerError } = await supabaseAdmin
    .from('profiles')
    .select('id, phone, email, name, type, address')
    .eq('type', 'customer')
    .not('phone', 'is', null);

  console.log("CUSTOMER PROFILES COUNT:", customerProfiles?.length || 0);
  console.log("CUSTOMER PROFILES ERROR:", customerError);
  console.log("CUSTOMER PROFILES DATA:", customerProfiles);

  // Get profiles with phones filtered by the SPECIFIC account type only
  const { data: profilesForAccountType, error: profilesError } = await supabaseAdmin
    .from('profiles')
    .select('id, phone, email, name, type, address')
    .eq('type', accountType)
    .not('phone', 'is', null);

  console.log(`PROFILES FOR ACCOUNT TYPE ${accountType} COUNT:`, profilesForAccountType?.length || 0);
  console.log(`PROFILES FOR ACCOUNT TYPE ${accountType} ERROR:`, profilesError);
  console.log(`PROFILES FOR ACCOUNT TYPE ${accountType} DATA:`, profilesForAccountType);

  if (profilesForAccountType && profilesForAccountType.length > 0) {
    for (const profile of profilesForAccountType) {
      if (profile.phone) {
        const profileCleanedPhone = profile.phone.replace(/\D/g, '');
        console.log(`Comparing phones: input="${cleanedPhone}" vs stored="${profileCleanedPhone}" (profile: ${profile.email}, type: ${profile.type})`);
        
        if (profileCleanedPhone === cleanedPhone) {
          console.log("PHONE MATCH FOUND - DUPLICATE DETECTED:", profile);
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
  console.log("=== PHONE DUPLICATE CHECK DEBUG END ===");
  return null;
};
