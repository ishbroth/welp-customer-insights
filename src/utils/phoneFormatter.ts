import { logger } from "@/utils/logger";

const utilLogger = logger.withContext('phoneFormatter');

/**
 * Format phone number to (XXX) XXX-XXXX format for display
 */
export const formatPhoneNumber = (phone: string | undefined | null): string => {
  if (!phone) return '';

  // Decode URL-encoded characters first
  const decoded = decodeURIComponent(phone);

  // Remove all non-digits
  const cleaned = decoded.replace(/\D/g, '');

  // Format progressively as user types
  // Only add formatting when we have enough digits to make it meaningful
  if (cleaned.length >= 6) {
    // Full formatting: (XXX) XXX-XXXX
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  } else if (cleaned.length >= 3) {
    // Partial formatting: (XXX) XXX
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
  }

  // For 1-2 digits, return raw digits without formatting
  // This allows backspacing freely without the opening parenthesis getting in the way
  return cleaned;
};

/**
 * Convert phone number to E.164 format (+1XXXXXXXXXX)
 */
export const formatPhoneForE164 = (phone: string | undefined | null): string => {
  if (!phone) return '';

  // Decode URL-encoded characters first
  const decoded = decodeURIComponent(phone);
  utilLogger.debug("Formatting to E.164 - input:", phone, "decoded:", decoded);

  // Remove all non-digits
  const cleaned = decoded.replace(/\D/g, '');
  utilLogger.debug("Cleaned digits:", cleaned);

  // Handle different number lengths
  let e164 = '';
  if (cleaned.length === 10) {
    e164 = '+1' + cleaned;
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    e164 = '+' + cleaned;
  } else if (cleaned.startsWith('+')) {
    e164 = cleaned;
  } else {
    // Default to US format
    e164 = '+1' + cleaned;
  }

  utilLogger.debug("E.164 result:", e164);
  return e164;
};
