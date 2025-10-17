// SMS SENDER - STUB - NOT IMPLEMENTED
// When approved: Set env vars, uncomment Twilio code below, enable in config

import { validateAndFormatPhone } from './smsValidator.ts';

export interface SMSOptions { to: string; message: string; }
export interface SMSResult { success: boolean; messageId?: string; error?: string; }

export async function sendSMS(opts: SMSOptions): Promise<SMSResult> {
  const phoneVal = validateAndFormatPhone(opts.to);
  if (!phoneVal.valid) return { success: false, error: phoneVal.error };

  console.log('📱 SMS (DISABLED):', opts.to);
  return { success: false, error: 'SMS disabled - waiting for approval' };

  /* TO IMPLEMENT WHEN APPROVED:
  // 1. Set env vars: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
  // 2. Uncomment code below
  // 3. Change sms: false to sms: true in notificationConfig.ts

  import { smsConfig } from './smsConfig.ts';

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${smsConfig.accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${smsConfig.accountSid}:${smsConfig.authToken}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: phoneVal.phone,
          From: smsConfig.fromNumber,
          Body: opts.message,
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json();
      return { success: false, error: err.message };
    }

    const data = await response.json();
    return { success: true, messageId: data.sid };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown' };
  }
  */
}

export async function sendSMSWithRetry(opts: SMSOptions, maxRetries = 3): Promise<SMSResult> {
  for (let i = 1; i <= maxRetries; i++) {
    const result = await sendSMS(opts);
    if (result.success) return result;
    if (i < maxRetries) await new Promise(r => setTimeout(r, 1000));
  }
  return { success: false, error: 'Failed after retries' };
}
