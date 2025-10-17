// SMS - FUTURE USE - DISABLED
import { notificationConfig } from '../../notificationConfig.ts';
export const smsConfig = notificationConfig.sms;

export function isValidPhoneNumber(phone: string): boolean {
  const d = phone.replace(/\D/g, '');
  return d.length === 10 || (d.length === 11 && d[0] === '1');
}

export function formatPhoneForSMS(phone: string): string {
  const d = phone.replace(/\D/g, '');
  if (d.length === 10) return `+1${d}`;
  if (d.length === 11 && d[0] === '1') return `+${d}`;
  return phone;
}
