# OTP Security Tightening Plan

## Overview
Improve OTP (One-Time Password) security based on Supabase security advisor recommendations.

## Current State
- OTP expiry exceeds 1 hour (security risk per Supabase advisor)
- Leaked password protection disabled
- Email verification using OTP
- Phone verification using OTP

## Work to be Done

### 1. Reduce OTP Expiry Time
Access Supabase Dashboard:
- Navigate to Authentication → Email Auth
- Set OTP expiry to **10 minutes** (recommended)
- Current: >1 hour → Target: 10 minutes
- Applies to email verification OTPs

### 2. Enable Leaked Password Protection
In Supabase Dashboard:
- Navigate to Authentication → Password Policy
- Enable "Check against HaveIBeenPwned database"
- Prevents users from using compromised passwords
- No code changes required

### 3. Phone OTP Security
Review phone verification OTP settings:
- Check `verification_codes` table structure
- Ensure `expires_at` is set appropriately
- Recommended: 5-10 minutes for phone OTPs
- Implement in Edge Function: `send-sms-verification`

### 4. OTP Attempt Limiting
Implement rate limiting for OTP attempts:
- Max 3 verification attempts per OTP
- Already have `attempt_count` in `verification_codes` table
- Already have `max_attempts` field (set to 3)
- Enforce in verification Edge Functions
- Lock account after max attempts exceeded

### 5. OTP Generation
Ensure strong OTP generation:
- Use cryptographically secure random
- 6-digit numeric code (phone)
- 6-character alphanumeric code (email)
- Avoid predictable patterns

### 6. OTP Resend Throttling
Prevent OTP spam:
- Limit OTP resend requests
- Min 60 seconds between resends
- Track in `auth_rate_limits` table
- Return helpful error messages

### 7. Single-Use OTP Enforcement
Ensure OTPs can only be used once:
- Mark as `used` in `email_verification_codes` table
- Delete from `verification_codes` after successful use
- Prevent replay attacks

### 8. OTP Delivery Security
Email OTP:
- Sent via Resend
- Use secure email templates
- Include expiry time in email
- Include warning about phishing

Phone OTP:
- Currently using placeholder
- Ensure SMS provider is secure
- Consider alternative delivery methods

### 9. Client-Side OTP Handling
Update OTP input components:
- Show countdown timer for expiry
- Clear indication of time remaining
- Auto-disable after expiry
- Secure input handling (no logging)

### 10. Audit Logging
Log all OTP-related events:
- OTP generation
- OTP verification attempts
- Failed attempts
- Expired OTPs
- Use `security_audit_log` table

### 11. Edge Function Updates
Update verification Edge Functions:
```typescript
// send-verification-code
- Generate secure OTP
- Set 10-minute expiry
- Enforce rate limits
- Log generation

// verify-phone-code
- Check expiry
- Check attempt count
- Mark as used
- Log verification
```

### 12. User Communication
Update user-facing messages:
- "Code expires in 10 minutes"
- "You have X attempts remaining"
- "Too many attempts. Try again in Y minutes"
- Help text for what to do if code expires

## Files to Update
- `supabase/functions/send-verification-code/index.ts`
- `supabase/functions/verify-phone-code/index.ts`
- `supabase/functions/send-email-verification-code/index.ts`
- `supabase/functions/verify-email-code/index.ts`
- `src/components/signup/PhoneVerificationFlow.tsx`
- `src/pages/VerifyPhone.tsx`
- `src/pages/VerifyEmail.tsx`

## Supabase Dashboard Changes
1. **Authentication → Email Auth**:
   - OTP expiry: Change to 600 seconds (10 minutes)

2. **Authentication → Password Policy**:
   - Enable "Check against HaveIBeenPwned"

3. **Verify Current Settings**:
   - Document current OTP settings
   - Take screenshots for reference

## Testing Checklist
- [ ] Email OTP expires after 10 minutes
- [ ] Phone OTP expires after 10 minutes
- [ ] Max 3 attempts enforced
- [ ] OTP cannot be reused
- [ ] Rate limiting prevents spam
- [ ] Timer displays correctly to user
- [ ] Helpful error messages shown
- [ ] Leaked passwords are rejected
- [ ] Audit logs capture events

## Deliverables
- OTP expiry reduced to 10 minutes
- Leaked password protection enabled
- Rate limiting enforced
- Single-use OTPs guaranteed
- User-friendly expiry indicators
- Comprehensive audit logging
- Updated documentation
