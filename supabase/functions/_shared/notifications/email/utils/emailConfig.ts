import { notificationConfig } from '../../notificationConfig.ts';
export const emailConfig = notificationConfig.email;
export const emailUrls = notificationConfig.urls;
export const emailSubjects = notificationConfig.messages.email;

export function validateEmailConfig(): boolean {
  if (!emailConfig.apiKey) {
    console.error('RESEND_API_KEY not set');
    return false;
  }
  return true;
}
