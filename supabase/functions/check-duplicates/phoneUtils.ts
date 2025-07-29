
import { DuplicateCheckResponse } from './types.ts'

export const checkPhoneDuplicates = async (
  supabaseAdmin: any,
  phone: string,
  accountType: string
): Promise<DuplicateCheckResponse | null> => {
  console.log("=== PHONE DUPLICATE CHECK DEBUG ===");
  console.log("Input phone:", phone);
  console.log("Account type:", accountType);

  // Normalize phone number - remove all non-digits
  const normalizedPhone = phone.replace(/\D/g, '');
  console.log("Normalized phone for comparison:", normalizedPhone);

  // Check for phone duplicates WITHIN the specified account type only
  const { data: phoneProfile, error: phoneError } = await supabaseAdmin
    .from('profiles')
    .select('id, email, name, type, phone, address')
    .eq('phone', normalizedPhone)
    .eq('type', accountType)
    .maybeSingle();

  console.log(`Phone check result (filtered by account type ${accountType}):`, { phoneProfile, phoneError });

  if (phoneProfile) {
    console.log("PHONE DUPLICATE FOUND WITHIN ACCOUNT TYPE:", phoneProfile);
    return {
      isDuplicate: true,
      duplicateType: 'phone',
      existingPhone: normalizedPhone,
      allowContinue: false // Block phone duplicates within same account type
    };
  }

  console.log(`No phone duplicates found within account type: ${accountType}`);
  console.log("=== PHONE DUPLICATE CHECK DEBUG END ===");
  return null;
};
