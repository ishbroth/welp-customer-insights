
# Phone Verification System Reference

## Overview
SMS-based phone verification using AWS SNS with Twilio fallback.

## Core Components
- **VerifyPhone**: Main verification page
- **usePhoneVerification**: Verification logic
- **usePhoneVerificationActions**: Verification actions
- **useVerificationTimer**: Resend timer management

## Verification Flow
1. User enters phone number during signup
2. SMS code sent via AWS SNS (primary) or Twilio (fallback)
3. User enters 6-digit code
4. Code validated against database
5. Account activated on successful verification

## Key Functions

### Send Verification Code
```typescript
const handleResendCode = async () => {
  const { success, error } = await resendVerificationCode({ phoneNumber });
}
```

### Verify Code
```typescript
const handleVerifyCode = async (verificationCode: string) => {
  const { data, error } = await supabase.functions.invoke('verify-phone-code', {
    body: { phoneNumber, code: verificationCode, userData }
  });
}
```

## Common Issues & Solutions

### Issue 1: SMS Not Delivered
**Symptoms**: User doesn't receive verification code
**Cause**: AWS SNS sandbox restrictions or provider issues
**Solution**: Check AWS console for delivery status, try Twilio fallback

### Issue 2: Code Expired
**Symptoms**: Valid code rejected
**Cause**: Code expired (10-minute limit)
**Solution**: Generate new code, cleanup expired codes

### Issue 3: Invalid Code Format
**Symptoms**: Code validation fails
**Cause**: Non-numeric characters or wrong length
**Solution**: Validate 6-digit numeric format before submission

## Testing Checklist
- [ ] SMS code sent successfully
- [ ] Code validates correctly
- [ ] Resend functionality works
- [ ] Expired codes handled properly
- [ ] Account created on successful verification
- [ ] Error messages clear and helpful
