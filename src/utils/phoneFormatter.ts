
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
  if (cleaned.length >= 6) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  } else if (cleaned.length >= 3) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
  } else if (cleaned.length > 0) {
    return `(${cleaned}`;
  }
  
  return cleaned;
};

/**
 * Convert phone number to E.164 format (+1XXXXXXXXXX)
 */
export const formatPhoneForE164 = (phone: string | undefined | null): string => {
  if (!phone) return '';

  // Decode URL-encoded characters first
  const decoded = decodeURIComponent(phone);
  console.log("🌐 Formatting to E.164 - input:", phone, "decoded:", decoded);

  // Remove all non-digits
  const cleaned = decoded.replace(/\D/g, '');
  console.log("🌐 Cleaned digits:", cleaned);

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

  console.log("🌐 E.164 result:", e164);
  return e164;
};
