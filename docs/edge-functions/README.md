# Edge Functions Documentation

Overview of all 32 deployed Supabase Edge Functions (Deno runtime).

## Quick Navigation

| Category | File | Count | Description |
|----------|------|-------|-------------|
| Auth | [auth-functions.md](auth-functions.md) | 6 | Phone/email verification via AWS SNS & Resend |
| Billing | [billing-functions.md](billing-functions.md) | 10 | Stripe integration, credits, subscriptions, refunds |
| Email | [email-functions.md](email-functions.md) | 3 | Resend email integration |
| Notifications | [notification-functions.md](notification-functions.md) | 2 | Email notifications for reviews/conversations |
| User | [user-functions.md](user-functions.md) | 11 | Profile, account, review management, utilities |

**Total**: 32 Edge Functions (3 marked obsolete)

## Authentication Matrix

| Function | Auth Required | JWT Verified | Anonymous OK |
|----------|---------------|--------------|--------------|
| **Auth Functions** | | | |
| verify-phone | Yes | Yes | No |
| verify-phone-code | No | No | Yes |
| send-verification-code | No | No | Yes |
| verify-email-code | Yes | Yes | No |
| send-email-verification-code | Yes | Yes | No |
| confirm-email | Yes | Yes | No |
| **Billing Functions** | | | |
| check-subscription | Yes | Yes | No |
| create-checkout | Yes | Yes | No |
| create-payment | Yes | Yes | No |
| create-credit-payment | Yes | Yes | No |
| create-legacy-payment | Yes | Yes | No |
| process-credit-purchase | Yes | Yes | No |
| process-payment-refund | No | Session metadata | System |
| get-billing-info | Yes | Yes | No |
| customer-portal | Yes | Yes | No |
| stripe-webhook | No | Stripe signature | System |
| **Email Functions** | | | |
| send-verification-request | Yes | Yes | No |
| verify-business | No | No | Yes |
| send-support-email | No | No | Yes |
| **Notification Functions** | | | |
| send-notification | Yes | Yes | No |
| conversation-notification | Yes | Yes | No |
| **User Functions** | | | |
| create-profile | Yes | Yes | No |
| delete-account | Yes | Yes | No |
| verify-business-license | Yes | Yes | No |
| delete-review | Yes | Yes | No |
| handle-guest-access | Yes | Yes | No |
| geocode-city | No | No | Yes |
| check-duplicates | Yes | Yes | Admin only |
| get-secret | No | Service role | System |

## Deployment Status

All 32 functions are deployed and active.

**Last Verified**: Based on agent audit with `mcp__supabase__list_edge_functions`

## External Service Dependencies

| Service | Functions Using It | API Key Location |
|---------|-------------------|------------------|
| **Stripe** | create-checkout, create-payment, create-credit-payment, create-legacy-payment, stripe-webhook, customer-portal, check-subscription, get-billing-info, process-credit-purchase, process-payment-refund, handle-guest-access | Supabase Edge Function secrets: `STRIPE_SECRET_KEY` |
| **Resend** | send-email-verification-code, send-verification-code, send-verification-request, verify-business, send-support-email, send-notification, conversation-notification | Supabase Edge Function secrets: `RESEND_API_KEY` |
| **AWS SNS** | verify-phone | Supabase Edge Function secrets: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_SNS_ORIGINATION_NUMBER` |
| **Google Maps** | geocode-city | Supabase Edge Function secrets: `GOOGLE_MAPS_API_KEY` |

**Phone Verification**: Uses AWS SNS for SMS (not Twilio, not email)

## Common Patterns

### JWT Verification
```typescript
import { verify_jwt } from '../_shared/jwt.ts';

const authHeader = req.headers.get('Authorization');
const user = await verify_jwt(authHeader); // Returns user_id or throws
```

### Supabase Client (Service Role)
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);
```

### CORS Headers
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

### Error Handling
```typescript
try {
  // Function logic
  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  });
} catch (error) {
  return new Response(JSON.stringify({ error: error.message }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 500,
  });
}
```

## Calling from Frontend

```typescript
import { supabase } from '@/integrations/supabase/client';

// Example: verify phone
const { data, error } = await supabase.functions.invoke('verify-phone', {
  body: { phone_number: '+1234567890', code: '123456' },
});

// Example: with auth
const { data, error } = await supabase.functions.invoke('update-profile', {
  body: { full_name: 'John Doe' },
  headers: {
    Authorization: `Bearer ${session.access_token}`,
  },
});
```

## Testing Edge Functions

**Local Testing**:
```bash
supabase functions serve function-name --env-file ./supabase/.env
```

**Invoke Locally**:
```bash
curl -i --location --request POST 'http://localhost:54321/functions/v1/function-name' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"key":"value"}'
```

**Check Logs**:
Use `mcp__supabase__get_logs` with service='edge-function'

## Edge Function Secrets

Configured in Supabase Dashboard → Edge Functions → Secrets:

- `STRIPE_SECRET_KEY` - Stripe API secret key
- `RESEND_API_KEY` - Resend email API key
- `AWS_ACCESS_KEY_ID` - AWS access key for SNS
- `AWS_SECRET_ACCESS_KEY` - AWS secret key for SNS
- `AWS_REGION` - AWS region for SNS (e.g., us-east-1)
- `AWS_SNS_ORIGINATION_NUMBER` - AWS SNS phone number for SMS
- `GOOGLE_MAPS_API_KEY` - Google Maps Geocoding API key
- `SUPABASE_URL` - Auto-provided
- `SUPABASE_SERVICE_ROLE_KEY` - Auto-provided
- `SUPABASE_ANON_KEY` - Auto-provided

**Never commit secrets to git!**

## Functions Marked for Deletion

**Cannot delete via MCP** - Manual deletion required via Supabase Dashboard

1. **get-twilio-info** - OBSOLETE (Twilio no longer used, switched to AWS SNS)
2. **send-push-notification** - OBSOLETE (Push notifications removed, see `docs/temp/13-push-notifications-removal.md`)
3. **send-sms-verification** - OBSOLETE (Twilio SMS sender, replaced by verify-phone with AWS SNS)

## Validation After Edge Function Changes

After modifying/deploying an Edge Function:

1. Run `mcp__supabase__list_edge_functions` to verify deployment
2. Use `mcp__supabase__get_logs` to check for errors
3. Update relevant docs in `edge-functions/*.md`
4. Update `architecture/deep-dive-*.md` if flow changed
5. Run through `docs/VALIDATION-CHECKLIST.md`

## Related Documentation

- **Database**: See `docs/database/` for tables used by functions
- **Architecture**: See `docs/architecture/` for complete feature flows
- **Quick Reference**: See `docs/QUICK-REFERENCE.md` for feature-to-function mapping
