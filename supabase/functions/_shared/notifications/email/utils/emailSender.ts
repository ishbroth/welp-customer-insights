import { emailConfig, validateEmailConfig } from './emailConfig.ts';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendEmail(opts: EmailOptions): Promise<EmailResult> {
  if (!validateEmailConfig()) return { success: false, error: 'Invalid config' };

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${emailConfig.apiKey}`,
      },
      body: JSON.stringify({
        from: emailConfig.from,
        to: Array.isArray(opts.to) ? opts.to : [opts.to],
        subject: opts.subject,
        html: opts.html,
        reply_to: opts.replyTo || emailConfig.replyTo,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      return { success: false, error: err.message || 'Failed' };
    }

    const data = await res.json();
    return { success: true, messageId: data.id };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown' };
  }
}

export async function sendEmailWithRetry(opts: EmailOptions, maxRetries = 3): Promise<EmailResult> {
  for (let i = 1; i <= maxRetries; i++) {
    const result = await sendEmail(opts);
    if (result.success) return result;
    if (i < maxRetries) await new Promise(r => setTimeout(r, 1000));
  }
  return { success: false, error: 'Failed after retries' };
}
