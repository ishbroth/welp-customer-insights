# SMS Implementation Guide

## Overview

Complete guide for implementing SMS notifications when approved by an SMS provider.

## Current Status

🚫 **SMS is prepared but disabled**

- ✅ Templates created
- ✅ Validation built
- ✅ Sender stub with implementation guide
- ✅ Edge Functions prepared
- 🚫 Needs provider approval + implementation

## Prerequisites

1. ✅ SMS provider approval (Twilio, AWS SNS, etc.)
2. ✅ Provider account and credentials
3. ✅ Phone number for sending
4. ✅ Budget allocated (~$0.0075 per SMS)
5. ✅ Testing plan

## Recommended Providers

### Twilio (Recommended)
- **Cost:** ~$0.0075 per SMS (US)
- **Docs:** https://www.twilio.com/docs/sms
- **Setup:** Easy

### AWS SNS
- **Cost:** ~$0.00645 per SMS (US)
- **Docs:** https://aws.amazon.com/sns/
- **Setup:** Medium difficulty

## Implementation Steps

### Step 1: Get Provider Approval
1. Sign up for account
2. Verify business
3. Request phone number
4. Get API credentials

### Step 2: Set Environment Variables

In Supabase Dashboard:

\`\`\`
TWILIO_ACCOUNT_SID=AC...your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+15551234567
\`\`\`

### Step 3: Implement SMS Sender

**File:** \`supabase/functions/_shared/notifications/sms/utils/smsSender.ts\`

Uncomment the Twilio implementation code (already written!)

### Step 4: Enable in Config

**File:** \`notificationConfig.ts\`

Change:
\`\`\`typescript
channels: {
  email: true,
  sms: true,  // ← Change from false
  push: false,
}
\`\`\`

### Step 5: Test

Run comprehensive tests:
- Valid phone numbers
- Invalid numbers
- Long messages
- Error handling

### Step 6: Deploy

\`\`\`bash
supabase functions deploy
\`\`\`

Monitor delivery rates and costs.

## Testing Checklist

- [ ] Provider account set up
- [ ] Environment variables configured
- [ ] SMS sender implemented
- [ ] SMS enabled in config
- [ ] Valid phone tests pass
- [ ] Invalid phone tests pass
- [ ] Error handling works
- [ ] Cost tracking active

## Timeline

**Total: 4-6 hours** after provider approval

## Created
October 15, 2025

## Status
📋 Ready to implement when approved
