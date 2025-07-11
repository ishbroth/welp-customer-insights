
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

  // First, let's check the total count of profiles in the database
  const { count: totalProfiles, error: countError } = await supabaseAdmin
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  console.log("📱 Total profiles in database:", totalProfiles);
  console.log("📱 Count query error:", countError);

  // If there are no profiles at all, there can't be duplicates
  if (totalProfiles === 0) {
    console.log("📱 Database is empty - no duplicates possible");
    console.log("📱=== PHONE DUPLICATE CHECK DEBUG END (EMPTY DB) ===");
    return null;
  }

  // Get all profiles for the specific account type that have phone numbers
  const { data: profilesWithPhones, error: phonesError } = await supabaseAdmin
    .from('profiles')
    .select('id, phone, email, name, type, address')
    .eq('type', accountType)
    .not('phone', 'is', null)
    .neq('phone', '');

  console.log("📱 Profiles with phones for account type '" + accountType + "':", profilesWithPhones?.length || 0);
  console.log("📱 Phone profiles error:", phonesError);

  if (phonesError) {
    console.log("📱 Error fetching profiles with phones:", phonesError);
    console.log("📱=== PHONE DUPLICATE CHECK DEBUG END (ERROR) ===");
    return null;
  }

  // If no profiles have phones, no duplicates possible
  if (!profilesWithPhones || profilesWithPhones.length === 0) {
    console.log("📱 No profiles with phones found for account type:", accountType);
    console.log("📱=== PHONE DUPLICATE CHECK DEBUG END (NO PHONES) ===");
    return null;
  }

  console.log("📱 Found profiles with phones:", JSON.stringify(profilesWithPhones, null, 2));

  // Check each profile's phone against our input
  for (const profile of profilesWithPhones) {
    if (!profile.phone) {
      console.log("📱 Skipping profile with null/empty phone:", profile.id);
      continue;
    }

    // Clean the stored phone number
    const cleanedStoredPhone = profile.phone.replace(/\D/g, '');
    
    console.log("📱 Comparing phones:");
    console.log("📱   Input: '" + cleanedInputPhone + "' (length: " + cleanedInputPhone.length + ")");
    console.log("📱   Stored: '" + cleanedStoredPhone + "' (length: " + cleanedStoredPhone.length + ")");
    console.log("📱   Profile:", JSON.stringify(profile, null, 2));
    
    // Exact match comparison
    if (cleanedStoredPhone === cleanedInputPhone) {
      console.log("🚨📱 PHONE DUPLICATE FOUND!");
      console.log("🚨📱 Matching profile:", JSON.stringify(profile, null, 2));
      console.log("📱=== PHONE DUPLICATE CHECK DEBUG END (DUPLICATE FOUND) ===");
      
      return {
        isDuplicate: true,
        duplicateType: 'phone',
        existingPhone: phone,
        existingEmail: profile.email || '',
        allowContinue: false
      };
    } else {
      console.log("📱 No match - phones are different");
    }
  }

  console.log("✅📱 No phone duplicates found within account type: " + accountType);
  console.log("📱=== PHONE DUPLICATE CHECK DEBUG END (NO DUPLICATES) ===");
  return null;
};
