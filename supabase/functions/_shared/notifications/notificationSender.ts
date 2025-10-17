import { notificationConfig, validateNotificationConfig } from './notificationConfig.ts';
import { sendEmailWithRetry } from './email/utils/emailSender.ts';

export interface NotificationRecipient {
  email?: string;
  phone?: string;
  preferredChannel?: 'email' | 'sms';
}

export interface NotificationOptions {
  to: NotificationRecipient;
  subject?: string;
  emailHtml?: string;
  smsMessage?: string;
}

export interface NotificationResult {
  success: boolean;
  channels: {
    email?: { sent: boolean; messageId?: string; error?: string };
    sms?: { sent: boolean; messageId?: string; error?: string };
  };
  error?: string;
}

export async function sendNotification(opts: NotificationOptions): Promise<NotificationResult> {
  const result: NotificationResult = { success: false, channels: {} };
  const config = validateNotificationConfig();

  // Email
  if (opts.to.email && opts.emailHtml && opts.subject && notificationConfig.channels.email) {
    if (!config.email) {
      result.channels.email = { sent: false, error: 'Config invalid' };
    } else {
      try {
        const r = await sendEmailWithRetry({ to: opts.to.email, subject: opts.subject, html: opts.emailHtml });
        result.channels.email = { sent: r.success, messageId: r.messageId, error: r.error };
        if (r.success) result.success = true;
      } catch (e) {
        result.channels.email = { sent: false, error: e instanceof Error ? e.message : 'Unknown' };
      }
    }
  }

  // SMS (disabled)
  if (opts.to.phone && opts.smsMessage) {
    result.channels.sms = { sent: false, error: 'SMS disabled' };
    console.log('📱 SMS skipped:', opts.to.phone);
  }

  if (!result.success) result.error = 'Failed all channels';
  return result;
}
