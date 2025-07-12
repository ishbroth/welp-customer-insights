
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

  // Get all profiles that have phone numbers
  const { data: allProfilesWithPhones, error: allPhonesError } = await supabaseAdmin
    .from('profiles')
    .select('id, phone, email, name, type, address')
    .not('phone', 'is', null)
    .neq('phone', '');

  console.log("📱 All profiles with phones (any type):", allProfilesWithPhones?.length || 0);
  console.log("📱 All phones error:", allPhonesError);

  if (allPhonesError) {
    console.log("📱 Error fetching all profiles with phones:", allPhonesError);
  }

  if (allProfilesWithPhones && allProfilesWithPhones.length > 0) {
    console.log("📱 Found profiles with phones:", JSON.stringify(allProfilesWithPhones, null, 2));
    
    // Check each profile's phone against our input
    for (const profile of allProfilesWithPhones) {
      if (!profile.phone) continue;

      const cleanedStoredPhone = profile.phone.replace(/\D/g, '');
      
      console.log("📱 Comparing phones:");
      console.log("📱   Input: '" + cleanedInputPhone + "' (length: " + cleanedInputPhone.length + ")");
      console.log("📱   Stored: '" + cleanedStoredPhone + "' (length: " + cleanedStoredPhone.length + ")");
      console.log("📱   Profile type:", profile.type);
      console.log("📱   Checking against account type:", accountType);
      
      // Only check within the same account type
      if (profile.type === accountType && cleanedStoredPhone === cleanedInputPhone) {
        console.log("🚨📱 PHONE DUPLICATE FOUND within same account type!");
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
        console.log("📱 No match - either different account type or different phone");
      }
    }
  } else {
    console.log("📱 No profiles with phones found");
  }

  console.log("✅📱 No phone duplicates found within account type: " + accountType);
  console.log("📱=== PHONE DUPLICATE CHECK DEBUG END (NO DUPLICATES) ===");
  return null;
};
