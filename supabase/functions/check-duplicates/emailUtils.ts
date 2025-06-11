
import { DuplicateCheckResponse } from './types.ts'

export const checkEmailDuplicates = async (
  supabaseAdmin: any,
  email: string,
  accountType: string
): Promise<DuplicateCheckResponse | null> => {
  const { data: emailProfile, error: emailError } = await supabaseAdmin
    .from('profiles')
    .select('id, email, name, type, phone, address')
    .eq('email', email)
    .eq('type', accountType)
    .maybeSingle();

  console.log("Email check result (filtered by account type):", { emailProfile, emailError, accountType });

  if (emailProfile) {
    return {
      isDuplicate: true,
      duplicateType: 'email',
      existingEmail: email,
      allowContinue: false
    };
  }

  return null;
};
