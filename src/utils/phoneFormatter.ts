
/**
 * Format phone number to (XXX) XXX-XXXX format for display
 */
export const formatPhoneNumber = (phone: string | undefined | null): string => {
  if (!phone) return '';
  
  // Decode URL-encoded characters first
  const decoded = decodeURIComponent(phone);
  console.log("📱 Formatting phone - input:", phone, "decoded:", decoded);
  
  // Remove all non-digits
  const cleaned = decoded.replace(/\D/g, '');
  console.log("📱 Cleaned digits:", cleaned);
  
  // Only format if we have a 10-digit number
  if (cleaned.length === 10) {
    const formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    console.log("📱 Formatted result:", formatted);
    return formatted;
  }
  
  // Return cleaned version if not 10 digits
  console.log("📱 Not 10 digits, returning cleaned:", cleaned);
  return cleaned;
};

/**
 * Convert phone number to E.164 format for Twilio (+1XXXXXXXXXX)
 */
export const formatPhoneForTwilio = (phone: string | undefined | null): string => {
  if (!phone) return '';
  
  // Decode URL-encoded characters first
  const decoded = decodeURIComponent(phone);
  console.log("🌐 Formatting for Twilio - input:", phone, "decoded:", decoded);
  
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
