
import { DuplicateCheckResponse } from './types.ts'

export const checkEmailDuplicates = async (
  supabaseAdmin: any,
  email: string,
  accountType: string
): Promise<DuplicateCheckResponse | null> => {
  console.log("=== EMAIL DUPLICATE CHECK DEBUG ===");
  console.log("Input email:", email);
  console.log("Account type:", accountType);

  // Check for email duplicates only within the specified account type
  const { data: emailProfile, error: emailError } = await supabaseAdmin
    .from('profiles')
    .select('id, email, name, type, phone, address')
    .eq('email', email)
    .eq('type', accountType)
    .maybeSingle();

  console.log(`Email check result (filtered by account type ${accountType}):`, { emailProfile, emailError });

  if (emailProfile) {
    console.log("EMAIL MATCH FOUND WITHIN ACCOUNT TYPE - DUPLICATE DETECTED:", emailProfile);
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
