# Email Edge Functions

Email sending via Resend API. No Twilio.

## send-verification-request

Send business verification request email.

- **Path**: `supabase/functions/send-verification-request/index.ts`
- **Auth Required**: Yes
- **Parameters**: `{ business_name: string, license_number?: string }`
- **Returns**: `{ success: boolean }`
- **Email**: Sends to admin email via Resend
- **Database**: Insert into `verification_requests`
- **Called From**: `src/components/verification/VerificationFormWrapper.tsx`

**Flow**:
1. Verify user JWT
2. Create verification request in database
3. Send email to admins notifying of new request
4. Return success

---

## verify-business

Approve business verification via token link.

- **Path**: `supabase/functions/verify-business/index.ts`
- **Auth Required**: No (token-based verification)
- **Parameters**: `{ token: string }` (query parameter)
- **Returns**: HTML response (success or error page)
- **Email**: Sends approval email to business owner via Resend
- **Database**: Updates `verification_requests`, `profiles.verified`, `business_info.verified`
- **Called From**: Email verification link (admin clicks link in email)

**Flow**:
1. Verify token from query parameter
2. Lookup verification request by token
3. If valid and pending:
   - Update `verification_requests.status = 'approved'`
   - Update `profiles.verified = true`
   - Update `business_info` with verified status
   - Send congratulatory email to business owner
4. Return HTML success page
5. If invalid/expired:
   - Return HTML error page

---

## send-support-email

Send support/contact form email.

- **Path**: `supabase/functions/send-support-email/index.ts`
- **Auth Required**: Yes (JWT verified)
- **Parameters**: `{ name: string, email: string, issueType: string, message: string }`
- **Returns**: `{ success: boolean, message: string }`
- **Email**: Sends to support@mywelp.com via Resend
- **Database**: None (direct email sending)
- **Called From**: `src/pages/Contact.tsx`

**Flow**:
1. Validate inputs
2. Send email to support address via Resend
3. Optionally send confirmation to sender
4. Return success

---

## Summary

**Total Functions**: 3

**Email Provider**: Resend
- API Key: `RESEND_API_KEY` in Edge Function secrets
- No Twilio integration

**Email Templates**:
- Business verification request notification (to admins)
- Business verification result (approval/rejection) (to business owner)
- Support inquiry (to support team)

**From Addresses**:
- Configure in Resend dashboard
- Typically: `noreply@domain.com`, `support@domain.com`, `verify@domain.com`

**Called From Frontend**:
- `src/pages/BusinessVerification.tsx` - Verification request
- `src/pages/Contact.tsx` - Support form
- Admin panel - Verification approval/rejection

**Database Tables Used**:
- `verification_requests` - Business verification workflow
- `business_info` - Update verified status

**Related Functions**:
- See `notification-functions.md` for review/conversation email notifications
- See `auth-functions.md` for verification code emails
