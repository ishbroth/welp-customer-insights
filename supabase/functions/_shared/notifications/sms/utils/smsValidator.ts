// SMS VALIDATOR - FUTURE
import { isValidPhoneNumber, formatPhoneForSMS } from './smsConfig.ts';

export function validateAndFormatPhone(phone: string) {
  const t = phone.trim();
  if (!t) return { valid: false, phone: t, error: 'Required' };
  if (!isValidPhoneNumber(t)) return { valid: false, phone: t, error: 'Invalid' };
  return { valid: true, phone: formatPhoneForSMS(t) };
}
