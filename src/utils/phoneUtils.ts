
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Format as (XXX) XXX-XXXX
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  // If it's not a 10-digit number, return as-is
  return phone;
};

/**
 * Normalizes a phone number to a clean 10-digit format
 * Handles US phone numbers with optional +1 prefix
 * @param phone - Phone number in any format
 * @returns Clean 10-digit phone number or empty string if invalid
 */
export const normalizePhoneNumber = (phone: string | undefined | null): string => {
  if (!phone) return '';

  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');

  // Remove leading '1' for US numbers (country code)
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    cleaned = cleaned.substring(1);
  }

  // Return only if we have exactly 10 digits
  return cleaned.length === 10 ? cleaned : '';
};

/**
 * Checks if two phone numbers are equivalent
 * Considers phones equivalent if:
 * - Exact 10-digit match after normalization, OR
 * - Last 7 digits match (same local number, possibly different area code)
 * @param phone1 - First phone number
 * @param phone2 - Second phone number
 * @returns True if phones are equivalent
 */
export const arePhonesEquivalent = (
  phone1: string | undefined | null,
  phone2: string | undefined | null
): boolean => {
  const clean1 = normalizePhoneNumber(phone1);
  const clean2 = normalizePhoneNumber(phone2);

  // Both must be valid 10-digit numbers
  if (!clean1 || !clean2) return false;

  // Exact match
  if (clean1 === clean2) return true;

  // Last 7 digits match (same local number, different area code)
  // This is less strict but useful for grouping same person with old/new area codes
  if (clean1.length >= 7 && clean2.length >= 7) {
    return clean1.slice(-7) === clean2.slice(-7);
  }

  return false;
};
