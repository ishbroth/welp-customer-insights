export const notificationConfig = {
  channels: { email: true, sms: false, push: false },
  email: {
    provider: 'resend',
    apiKey: Deno.env.get('RESEND_API_KEY') || '',
    from: 'Welp! <notifications@mywelp.com>',
    replyTo: 'support@mywelp.com',
    maxRetries: 3,
    retryDelay: 1000,
  },
  sms: {
    provider: 'twilio',
    accountSid: Deno.env.get('TWILIO_ACCOUNT_SID') || '',
    authToken: Deno.env.get('TWILIO_AUTH_TOKEN') || '',
    fromNumber: Deno.env.get('TWILIO_PHONE_NUMBER') || '',
    maxRetries: 3,
    retryDelay: 1000,
    maxLength: 160,
    longMessageStrategy: 'split',
  },
  urls: {
    app: 'https://mywelp.com',
    dashboard: 'https://mywelp.com/dashboard',
    support: 'https://mywelp.com/support',
    unsubscribe: 'https://mywelp.com/unsubscribe',
  },
  messages: {
    email: {
      newReview: (n: string) => `New review - ${n}`,
      newResponse: (n: string) => `${n} responded`,
      welcome: 'Welcome to Welp!',
      passwordReset: 'Reset password',
    },
    sms: {
      newReview: (n: string) => `Welp: New review from ${n}`,
      newResponse: (n: string) => `Welp: ${n} responded`,
      welcome: 'Welcome to Welp!',
    },
  },
} as const;

export function validateNotificationConfig() {
  const errors: string[] = [];
  let emailValid = false, smsValid = false;

  if (notificationConfig.channels.email) {
    emailValid = !!notificationConfig.email.apiKey;
    if (!emailValid) errors.push('RESEND_API_KEY not set');
  }

  if (notificationConfig.channels.sms) {
    smsValid = !!(notificationConfig.sms.accountSid &&
                  notificationConfig.sms.authToken &&
                  notificationConfig.sms.fromNumber);
    if (!smsValid) errors.push('Twilio credentials not set');
  } else {
    smsValid = true;
  }

  return { email: emailValid, sms: smsValid, errors };
}
