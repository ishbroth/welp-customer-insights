# Notification System

## Status
- ✅ **Email**: Active (Resend)
- 🚫 **SMS**: Prepared but disabled (waiting for provider approval)
- 🚫 **Push**: Removed permanently

## Architecture

```
_shared/notifications/
├── index.ts                          # Main export
├── notificationConfig.ts             # Central config
├── notificationSender.ts             # Unified sender
├── email/                            # Email system (ACTIVE)
│   ├── templates/
│   │   ├── base.ts
│   │   ├── reviewNotification.ts
│   │   ├── responseNotification.ts
│   │   └── welcomeEmail.ts
│   └── utils/
│       ├── emailSender.ts
│       ├── emailValidator.ts
│       └── emailConfig.ts
└── sms/                              # SMS system (FUTURE)
    ├── templates/
    │   └── reviewNotification.ts
    └── utils/
        ├── smsSender.ts              # Stub implementation
        ├── smsValidator.ts
        └── smsConfig.ts
```

## Usage

### Current: Email-Only Notifications

\`\`\`typescript
import {
  sendNotification,
  createReviewNotificationEmail,
} from '../_shared/notifications/index.ts';

const emailHtml = createReviewNotificationEmail({
  businessName: 'Acme Corp',
  reviewerName: 'John Doe',
  rating: 5,
  reviewContent: 'Great service!',
  reviewId: 'review-123',
  recipientEmail: 'business@example.com',
});

const result = await sendNotification({
  to: { email: 'business@example.com' },
  subject: 'New Review',
  emailHtml,
});

console.log('Email sent:', result.channels.email?.sent);
\`\`\`

### Future: Email + SMS

\`\`\`typescript
import {
  sendNotification,
  createReviewNotificationEmail,
  createReviewNotificationSMS,
} from '../_shared/notifications/index.ts';

const emailHtml = createReviewNotificationEmail({...});
const smsMessage = createReviewNotificationSMS({
  businessName: 'Acme Corp',
  reviewerName: 'John Doe',
  rating: 5,
  reviewId: 'review-123',
});

// When SMS is enabled
const result = await sendNotification({
  to: {
    email: 'business@example.com',
    phone: '+15551234567',
  },
  subject: 'New Review',
  emailHtml,
  smsMessage,
});

console.log('Email:', result.channels.email?.sent);
console.log('SMS:', result.channels.sms?.sent);
\`\`\`

## Email System (Active)

**Provider:** Resend
**API Key:** \`RESEND_API_KEY\` environment variable
**From:** \`Welp! <notifications@mywelp.com>\`

### Templates:
- Base Template - Consistent branding
- Review Notification - New reviews
- Response Notification - Review responses
- Welcome Email - User onboarding

### Features:
- Responsive design
- Retry logic (3 attempts)
- Error handling
- Delivery tracking

## SMS System (Future)

### Current State:
- ✅ Infrastructure created
- ✅ Templates ready
- ✅ Validation ready
- 🚫 Sender stub (needs implementation)
- 🚫 Disabled in config

### To Enable SMS:

See [sms-implementation-guide.md](./sms-implementation-guide.md)

**Quick steps:**
1. Get SMS provider approval
2. Set environment variables
3. Uncomment code in smsSender.ts
4. Change \`sms: false\` to \`sms: true\`
5. Test and deploy

**Time:** 4-6 hours after approval

## Environment Variables

### Required (Active):
- \`RESEND_API_KEY\` - Resend API key

### Future (SMS):
- \`TWILIO_ACCOUNT_SID\`
- \`TWILIO_AUTH_TOKEN\`
- \`TWILIO_PHONE_NUMBER\`

## Created
October 15, 2025

## Status
- Email: ✅ Production ready
- SMS: 🚫 Ready to implement (4-6 hours)
- Push: ❌ Removed permanently
