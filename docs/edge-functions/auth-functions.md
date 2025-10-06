# Authentication Edge Functions

Phone and email verification functions.

## verify-phone

Send or verify phone number OTP via AWS SNS SMS.

- **Path**: `supabase/functions/verify-phone/index.ts`
- **Auth Required**: Yes (JWT verified)
- **Parameters**:
  - Send: `{ phoneNumber: string, actionType: 'send' }`
  - Verify: `{ phoneNumber: string, code: string, actionType: 'verify' }`
- **Returns**:
  - Send: `{ success: boolean, message: string }`
  - Verify: `{ success: boolean, isValid: boolean, message: string }`
- **SMS**: Uses AWS SNS (not email, not Twilio)
- **Database**: Upserts into `verification_codes` with 10-minute expiry
- **External Service**: AWS SNS via API (requires AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_SNS_ORIGINATION_NUMBER)
- **Called From**: `src/components/signup/PhoneVerificationFlow.tsx`

**Flow (Send)**:
1. Clean phone to E.164 format (+1XXXXXXXXXX)
2. Generate 6-digit OTP
3. Store in `verification_codes` with 10-minute expiry
4. Send SMS via AWS SNS API with AWS Signature v4
5. Return success

**Flow (Verify)**:
1. Check code exists in `verification_codes` for phone
2. Verify code matches and not expired
3. Delete used code
4. Return validation result

---

## verify-phone-code

Verify phone code during signup and create account.

- **Path**: `supabase/functions/verify-phone-code/index.ts`
- **Auth Required**: No
- **Parameters**: `{ phoneNumber: string, code: string, userData: { email, password, name, firstName, lastName, accountType, address, city, state, zipCode, businessName? } }`
- **Returns**: `{ success: boolean, isValid: boolean, session?, user? }`
- **Database**: Checks `verification_codes`, creates auth user, calls create-profile
- **Called From**: Signup flow after phone verification

**Flow**:
1. Validate phone code from `verification_codes`
2. Create auth user via admin API (email_confirm: true)
3. Call create-profile edge function to create profile
4. Auto sign-in user
5. Return session and user data

---

## send-verification-code

Send phone verification code via email (legacy, use verify-phone instead).

- **Path**: `supabase/functions/send-verification-code/index.ts`
- **Auth Required**: No
- **Parameters**: `{ phone_number: string }`
- **Returns**: `{ success: boolean }`
- **Database**: Insert into `verification_codes`
- **Email**: Send code via Resend
- **Note**: Legacy function - verify-phone is preferred

---

## verify-email-code

Verify email with OTP code.

- **Path**: `supabase/functions/verify-email-code/index.ts`
- **Auth Required**: Yes (JWT verified)
- **Parameters**: `{ email: string, code: string }`
- **Returns**: `{ success: boolean }`
- **Database**: Updates `email_verification_codes.verified = true`
- **Called From**: `src/components/auth/EmailVerification.tsx`

**Flow**:
1. Check code exists in `email_verification_codes` for email
2. Verify code matches and not expired
3. Mark code as verified
4. Return success

---

## send-email-verification-code

Send email verification code via Resend.

- **Path**: `supabase/functions/send-email-verification-code/index.ts`
- **Auth Required**: Yes (JWT verified)
- **Parameters**: `{ email: string }`
- **Returns**: `{ success: boolean, message: string }`
- **Database**: Upsert into `email_verification_codes` with 10-minute expiry
- **Email**: Send code via Resend API
- **Called From**: `src/components/auth/EmailVerification.tsx`

**Flow**:
1. Generate 6-digit OTP
2. Store in `email_verification_codes` with 10-minute expiry
3. Send email via Resend with code
4. Return success with Resend email ID

---

## confirm-email

Confirm email verified status after code verification.

- **Path**: `supabase/functions/confirm-email/index.ts`
- **Auth Required**: Yes (JWT verified)
- **Parameters**: `{ }`
- **Returns**: `{ success: boolean }`
- **Database**: Updates `profiles.email_verified = true`
- **Called From**: `src/hooks/useEmailVerification.ts`

**Flow**:
1. Verify JWT
2. Check email_verification_codes has verified entry for user
3. Update `profiles.email_verified = true`
4. Return success

---

## Summary

**Total Functions**: 6

**Key Points**:
- **Phone Verification**: Uses AWS SNS for SMS (not Twilio, not email)
- **Email Verification**: Uses Resend for email codes
- **OTP Expiry**: 10 minutes for all codes
- **Phone Format**: E.164 format (+1XXXXXXXXXX)
- **Legacy**: send-verification-code exists but verify-phone preferred

**External Services**:
- **AWS SNS**: Phone SMS (verify-phone)
- **Resend**: Email codes (send-email-verification-code)

**Common Flow**:
1. User requests verification code
2. Generate 6-digit OTP
3. Store in database with 10-minute expiry
4. Send via SMS (AWS SNS) or Email (Resend)
5. User submits code
6. Verify code matches and not expired
7. Mark verified or delete used code
8. Return success
