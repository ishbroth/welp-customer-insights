
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Profile, DuplicateCheckResponse } from './types.ts'

export const checkPhoneDuplicates = async (
  supabaseAdmin: any,
  phone: string,
  accountType: string
): Promise<DuplicateCheckResponse | null> => {
  // Clean the input phone number - remove all non-digits
  const cleanedInputPhone = phone.replace(/\D/g, '');
  
  console.log("📱=== PHONE DUPLICATE CHECK DEBUG START ===");
  console.log("📱 Raw input phone:", phone);
  console.log("📱 Cleaned input phone:", cleanedInputPhone);
  console.log("📱 Account type:", accountType);
  console.log("📱 Cleaned phone length:", cleanedInputPhone.length);

  // Validate that we have a proper phone number
  if (!cleanedInputPhone || cleanedInputPhone.length < 10) {
    console.log("📱 Invalid phone number - too short or empty");
    console.log("📱=== PHONE DUPLICATE CHECK DEBUG END (INVALID) ===");
    return null;
  }

  // CRITICAL: Check total profiles count first with explicit logging
  console.log("📱 EXECUTING: Database count query...");
  const { count: totalProfiles, error: countError } = await supabaseAdmin
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  console.log("📱 RESULT: Total profiles count:", totalProfiles);
  console.log("📱 RESULT: Count query error:", countError);
  console.log("📱 RESULT: Type of totalProfiles:", typeof totalProfiles);
  console.log("📱 RESULT: totalProfiles === null:", totalProfiles === null);
  console.log("📱 RESULT: totalProfiles === 0:", totalProfiles === 0);

  if (countError) {
    console.log("📱 ERROR: Database count query failed:", countError);
    console.log("📱=== PHONE DUPLICATE CHECK DEBUG END (COUNT ERROR) ===");
    return null;
  }

  // CRITICAL: If database is empty, return no duplicates immediately
  if (totalProfiles === 0 || totalProfiles === null) {
    console.log("📱 CRITICAL: Database is empty (totalProfiles = " + totalProfiles + ") - RETURNING NULL");
    console.log("📱=== PHONE DUPLICATE CHECK DEBUG END (EMPTY DB) ===");
    return null;
  }

  console.log("📱 CONTINUING: Database has " + totalProfiles + " profiles, proceeding with phone check...");

  // Get all profiles that have phone numbers for the specified account type
  console.log("📱 EXECUTING: Phone profiles query for account type:", accountType);
  const { data: profilesWithPhones, error: phonesError } = await supabaseAdmin
    .from('profiles')
    .select('id, phone, email, name, type, address')
    .eq('type', accountType)
    .not('phone', 'is', null)
    .neq('phone', '');

  console.log("📱 RESULT: Profiles with phones found:", profilesWithPhones?.length || 0);
  console.log("📱 RESULT: Phone query error:", phonesError);
  console.log("📱 RESULT: Full profiles data:", JSON.stringify(profilesWithPhones, null, 2));

  if (phonesError) {
    console.log("📱 ERROR: Phone query failed:", phonesError);
    console.log("📱=== PHONE DUPLICATE CHECK DEBUG END (PHONE QUERY ERROR) ===");
    return null;
  }

  if (!profilesWithPhones || profilesWithPhones.length === 0) {
    console.log("📱 SUCCESS: No profiles with phones found for account type: " + accountType);
    console.log("📱=== PHONE DUPLICATE CHECK DEBUG END (NO PHONES) ===");
    return null;
  }

  console.log("📱 PROCESSING: Found " + profilesWithPhones.length + " profiles with phones for account type '" + accountType + "'");
  
  // Check each profile's phone against our input
  for (let i = 0; i < profilesWithPhones.length; i++) {
    const profile = profilesWithPhones[i];
    console.log("📱 CHECKING PROFILE " + (i + 1) + ":");
    console.log("📱   Profile ID:", profile.id);
    console.log("📱   Profile phone raw:", profile.phone);
    console.log("📱   Profile type:", profile.type);
    console.log("📱   Profile name:", profile.name);

    if (!profile.phone) {
      console.log("📱   SKIPPING: Profile has null/empty phone");
      continue;
    }

    const cleanedStoredPhone = profile.phone.replace(/\D/g, '');
    
    console.log("📱   COMPARISON:");
    console.log("📱     Input cleaned: '" + cleanedInputPhone + "' (length: " + cleanedInputPhone.length + ")");
    console.log("📱     Stored cleaned: '" + cleanedStoredPhone + "' (length: " + cleanedStoredPhone.length + ")");
    console.log("📱     Exact match:", cleanedStoredPhone === cleanedInputPhone);
    console.log("📱     Input === Stored:", cleanedInputPhone === cleanedStoredPhone);
    
    if (cleanedStoredPhone === cleanedInputPhone) {
      console.log("🚨📱 DUPLICATE FOUND!");
      console.log("🚨📱 Matching profile full data:", JSON.stringify(profile, null, 2));
      console.log("📱=== PHONE DUPLICATE CHECK DEBUG END (DUPLICATE FOUND) ===");
      
      return {
        isDuplicate: true,
        duplicateType: 'phone',
        existingPhone: phone,
        existingEmail: profile.email || '',
        allowContinue: false
      };
    } else {
      console.log("📱   RESULT: No match for profile " + profile.id);
    }
  }

  console.log("✅📱 FINAL RESULT: No phone duplicates found for account type: " + accountType);
  console.log("📱=== PHONE DUPLICATE CHECK DEBUG END (NO DUPLICATES) ===");
  return null;
};
