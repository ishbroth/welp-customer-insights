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
- **Called From**: `src/pages/BusinessVerification.tsx`

**Flow**:
1. Verify user JWT
2. Create verification request in database
3. Send email to admins notifying of new request
4. Return success

---

## verify-business

Approve/reject business verification.

- **Path**: `supabase/functions/verify-business/index.ts`
- **Auth Required**: Yes (Admin only)
- **Parameters**: `{ request_id: string, action: 'approve' | 'reject', rejection_reason?: string }`
- **Returns**: `{ success: boolean }`
- **Email**: Sends result to business owner via Resend
- **Database**: Updates `verification_requests`, `business_info.verified`
- **Called From**: Admin panel

**Flow**:
1. Verify admin JWT
2. Lookup verification request
3. If approved:
   - Update `business_info.verified = true`
   - Update `verification_requests.status = 'approved'`
   - Send approval email
4. If rejected:
   - Update `verification_requests.status = 'rejected'`
   - Send rejection email with reason
5. Return success

---

## send-support-email

Send support/contact form email.

- **Path**: `supabase/functions/send-support-email/index.ts`
- **Auth Required**: No
- **Parameters**: `{ from_email: string, from_name: string, subject: string, message: string }`
- **Returns**: `{ success: boolean }`
- **Email**: Sends to support email via Resend
- **Database**: None (could log to support tickets table)
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
