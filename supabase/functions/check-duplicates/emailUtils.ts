
import { DuplicateCheckResponse } from './types.ts'

export const checkEmailDuplicates = async (
  supabaseAdmin: any,
  email: string,
  accountType: string
): Promise<DuplicateCheckResponse | null> => {
  console.log("=== EMAIL DUPLICATE CHECK DEBUG ===");
  console.log("Input email:", email);
  console.log("Account type:", accountType);

  // First, let's check if there are ANY profiles at all
  const { data: allProfiles, error: allError } = await supabaseAdmin
    .from('profiles')
    .select('id, email, name, type, phone, address')
    .limit(10);

  console.log("ALL PROFILES FOR EMAIL CHECK COUNT:", allProfiles?.length || 0);
  console.log("ALL PROFILES FOR EMAIL CHECK ERROR:", allError);
  console.log("ALL PROFILES FOR EMAIL CHECK DATA:", allProfiles);

  const { data: emailProfile, error: emailError } = await supabaseAdmin
    .from('profiles')
    .select('id, email, name, type, phone, address')
    .eq('email', email)
    .eq('type', accountType)
    .maybeSingle();

  console.log("Email check result (filtered by account type):", { emailProfile, emailError, accountType });

  if (emailProfile) {
    console.log("EMAIL MATCH FOUND - DUPLICATE DETECTED:", emailProfile);
    return {
      isDuplicate: true,
      duplicateType: 'email',
      existingEmail: email,
      allowContinue: false
    };
  }

  console.log(`No email duplicates found within account type: ${accountType}`);
  console.log("=== EMAIL DUPLICATE CHECK DEBUG END ===");
  return null;
};
