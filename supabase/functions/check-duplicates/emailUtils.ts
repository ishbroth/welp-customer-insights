
import { DuplicateCheckResponse } from './types.ts'

export const checkEmailDuplicates = async (
  supabaseAdmin: any,
  email: string,
  accountType: string | null // Make accountType optional to allow checking all types
): Promise<DuplicateCheckResponse | null> => {
  console.log("=== EMAIL DUPLICATE CHECK DEBUG ===");
  console.log("Input email:", email);
  console.log("Account type filter:", accountType);

  // Check for email duplicates ACROSS ALL ACCOUNT TYPES (no type filter)
  let query = supabaseAdmin
    .from('profiles')
    .select('id, email, name, type, phone, address')
    .eq('email', email);

  // Only apply account type filter if specifically requested (for backward compatibility)
  if (accountType) {
    query = query.eq('type', accountType);
    console.log(`Filtering by account type: ${accountType}`);
  } else {
    console.log("Checking email across ALL account types");
  }

  const { data: emailProfile, error: emailError } = await query.maybeSingle();

  console.log(`Email check result:`, { emailProfile, emailError });

  if (emailProfile) {
    console.log("EMAIL DUPLICATE FOUND - BLOCKING REGISTRATION:", emailProfile);
    return {
      isDuplicate: true,
      duplicateType: 'email',
      existingEmail: email,
      allowContinue: false // Always block email duplicates
    };
  }

  console.log("No email duplicates found");
  console.log("=== EMAIL DUPLICATE CHECK DEBUG END ===");
  return null;
};
