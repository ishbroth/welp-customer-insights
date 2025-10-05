# Email Encapsulation Plan

## Overview
Centralize all email-related functionality to ensure consistent email handling, templates, and delivery.

## Current State
- Resend integration scattered across Edge Functions
- Email templates in multiple locations
- No centralized email configuration
- No email preview/testing system

## Work to be Done

### 1. Create Shared Email Utility
Create `supabase/functions/_shared/email.ts`:

```typescript
// Email types
interface EmailOptions {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  from?: string
  replyTo?: string
}

// Main email sender
sendEmail(options: EmailOptions)

// Template-based emails
sendVerificationEmail(to, token)
sendPasswordResetEmail(to, resetLink)
sendBusinessVerificationEmail(to, businessName)
sendWelcomeEmail(to, userName)
sendReviewNotification(to, reviewDetails)
sendResponseNotification(to, responseDetails)
```

### 2. Email Templates
Create template system in `supabase/functions/_shared/templates/`:
- `verification.ts` - Email verification template
- `passwordReset.ts` - Password reset template
- `welcome.ts` - Welcome email template
- `reviewNotification.ts` - New review notification
- `responseNotification.ts` - Response notification
- `businessVerification.ts` - Business verification
- `layout.ts` - Base email layout (header/footer)

### 3. Template Engine
Use template literals or a library:
- Variable substitution
- Conditional content
- Loops for lists
- Component-based templates

### 4. Email Configuration
Centralize config:
```typescript
const emailConfig = {
  from: 'Welp <noreply@welp.com>',
  replyTo: 'support@welp.com',
  baseUrl: 'https://welp.com',
  logoUrl: 'https://welp.com/logo.png'
}
```

### 5. Resend Integration
Consolidate Resend usage:
- Single Resend client instance
- Error handling wrapper
- Retry logic for failures
- Rate limit handling
- Delivery status tracking

### 6. Update Edge Functions
Refactor existing email Edge Functions:
- `send-verification-request` - Use email utility
- `send-support-email` - Use email utility
- `verify-business` - Use email utility
- Remove duplicate email code

### 7. Email Testing
Development tools:
- Email preview function
- Test email sending
- Template validation
- Log email attempts in development

### 8. Email Logging
Track all emails sent:
- Log to `notifications_log` table
- Track delivery status
- Track failures
- Enable email history view

### 9. Email Validation
Add email validation utility:
```typescript
validateEmail(email)
normalizeEmail(email)
isDisposableEmail(email)
```

### 10. Unsubscribe Handling
Add unsubscribe functionality:
- Unsubscribe links in emails
- Unsubscribe preferences
- Email preference management

## Files to Create
- `supabase/functions/_shared/email.ts` - Core email utility
- `supabase/functions/_shared/emailConfig.ts` - Configuration
- `supabase/functions/_shared/templates/verification.ts`
- `supabase/functions/_shared/templates/passwordReset.ts`
- `supabase/functions/_shared/templates/welcome.ts`
- `supabase/functions/_shared/templates/reviewNotification.ts`
- `supabase/functions/_shared/templates/responseNotification.ts`
- `supabase/functions/_shared/templates/businessVerification.ts`
- `supabase/functions/_shared/templates/layout.ts`
- `src/utils/emailValidation.ts` - Client-side validation

## Files to Update
- `supabase/functions/send-verification-request/index.ts`
- `supabase/functions/send-support-email/index.ts`
- `supabase/functions/verify-business/index.ts`
- Any other Edge Functions sending emails

## Deliverables
- Centralized email system
- Consistent email templates
- Branded email design
- Email testing tools
- Reliable email delivery
- Email documentation
