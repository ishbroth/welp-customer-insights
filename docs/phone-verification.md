
# Phone Verification System Documentation

## Overview
SMS-based phone number verification system using AWS SNS as primary provider with Twilio fallback support.

## Core Components

### Main Files
- `src/pages/VerifyPhone.tsx` - Phone verification page
- `src/hooks/usePhoneVerification.ts` - Verification logic and state
- `src/components/verification/VerificationCodeInput.tsx` - Code input UI
- `supabase/functions/send-verification-code/` - SMS sending edge function
- `supabase/functions/verify-phone-code/` - Code validation edge function

### Verification Flow

1. **Code Generation & Sending**
   - 6-digit random code generation
   - Store in `verification_codes` table with 10-minute expiration
   - Send via AWS SNS (primary) or Twilio (fallback)
   - Rate limiting: 1 code per minute per phone number

2. **Code Input & Validation**
   - User enters 6-digit code
   - Real-time validation on input completion
   - Code expiration checking
   - Account activation on successful verification

3. **Resend Functionality**
   - 60-second countdown between resend attempts
   - New code generation invalidates previous codes
   - Same delivery method selection

## SMS Providers

### AWS SNS (Primary)
**Configuration Required:**
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key  
- `AWS_REGION` - AWS region (e.g., us-west-1)
- `AWS_SNS_ORIGINATION_NUMBER` - Origination phone number

**Sandbox Mode Considerations:**
- Requires phone number verification in AWS console
- Limited to verified numbers only
- Production mode removes these restrictions

### Twilio (Fallback)
**Configuration Required:**
- `TWILIO_ACCOUNT_SID` - Twilio account identifier
- `TWILIO_AUTH_TOKEN` - Twilio authentication token
- `TWILIO_PHONE_NUMBER` - Twilio phone number

## Database Schema

### verification_codes Table
```sql
- id: uuid (primary key)
- phone: text (phone number)
- code: text (6-digit verification code)
- created_at: timestamp
- expires_at: timestamp (created_at + 10 minutes)
```

### Policies
- No direct access policy (all operations via edge functions)
- Automatic cleanup of expired codes via trigger

## Edge Functions

### send-verification-code
**Purpose:** Generate and send SMS verification codes
**Input:** `{ phoneNumber: string }`
**Output:** `{ success: boolean, message: string }`

**Logic:**
1. Clean up expired codes for phone number
2. Generate new 6-digit code
3. Store in database with expiration
4. Attempt SMS delivery via AWS SNS
5. Fallback to Twilio if AWS fails

### verify-phone-code
**Purpose:** Validate verification codes and activate accounts
**Input:** `{ phoneNumber: string, code: string, userData: object }`
**Output:** `{ success: boolean, user?: object }`

**Logic:**
1. Validate code against database
2. Check expiration
3. Create/activate user account
4. Clean up verification code
5. Return user session data

## Phone Number Formatting

### Input Processing
- Remove all non-digit characters
- Add +1 country code for US numbers
- Validate 10-digit US format
- Display formatted: (XXX) XXX-XXXX

### Storage Format
- Database: E.164 format (+1XXXXXXXXXX)
- Display: Formatted US format
- SMS sending: E.164 format

## Error Handling

### Common Issues
1. **SMS Delivery Failure**
   - AWS SNS errors (sandbox, invalid number)
   - Twilio quota exceeded
   - Network connectivity issues

2. **Code Validation Errors**
   - Expired codes (>10 minutes)
   - Invalid code format
   - Already used codes
   - Rate limiting exceeded

3. **Account Creation Issues**
   - Duplicate accounts
   - Profile creation failures
   - Session establishment problems

### Recovery Mechanisms
- Automatic fallback between SMS providers
- Code resend with new generation
- Clear error messaging to users
- Graceful degradation for service outages

## Rate Limiting

### SMS Sending
- 1 code per minute per phone number
- Cleanup of expired codes before new generation
- Provider-specific rate limits respected

### Code Attempts
- No specific attempt limits (codes expire in 10 minutes)
- New code generation invalidates previous codes
- Resend button disabled during countdown

## Security Considerations

### Code Generation
- Cryptographically secure random generation
- 6-digit codes (1 in 1,000,000 chance)
- Short expiration time (10 minutes)
- Single-use codes

### Database Security
- Row-level security prevents direct access
- Edge functions use service role for operations
- Automatic cleanup of expired data
- No sensitive data logging

## Testing & Development

### AWS SNS Testing
- Sandbox mode requires number verification
- Test with verified numbers only
- Check AWS console for delivery confirmations

### Twilio Testing
- Use trial account for development
- Monitor usage quotas
- Test with various number formats

### Local Development
- Mock SMS sending for faster testing
- Use console logging for code display
- Environment variable validation

## Monitoring & Analytics

### Success Metrics
- Code delivery success rate
- Verification completion rate
- Provider failover frequency
- Average verification time

### Error Tracking
- SMS delivery failures by provider
- Code validation error types
- Account creation success rate
- Rate limiting trigger frequency

## Configuration Checklist

### AWS SNS Setup
- [ ] Create AWS account and IAM user
- [ ] Generate access keys with SNS permissions
- [ ] Configure origination number
- [ ] Verify phone numbers (sandbox mode)
- [ ] Request production access if needed

### Twilio Setup
- [ ] Create Twilio account
- [ ] Purchase phone number
- [ ] Generate API credentials
- [ ] Configure webhook endpoints (if needed)
- [ ] Monitor usage and billing

### Supabase Configuration
- [ ] Add all required secrets
- [ ] Deploy edge functions
- [ ] Test database permissions
- [ ] Configure RLS policies
- [ ] Set up monitoring
