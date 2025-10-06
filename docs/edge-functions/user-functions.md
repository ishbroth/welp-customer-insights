# User & Admin Edge Functions

Profile management, account operations, and admin utilities.

## User Management Functions

### create-profile

Create user profile after signup.

- **Path**: `supabase/functions/create-profile/index.ts`
- **Auth Required**: No (called during signup)
- **Parameters**: `{ user_id: string, email: string, role: 'customer' | 'business', full_name?: string }`
- **Returns**: `{ success: boolean, profile_id: string }`
- **Database**: Insert into `profiles`
- **Called From**: Signup flow, auth triggers

**Flow**:
1. Validate inputs
2. Insert into `profiles` table
3. Create default `notification_preferences`
4. Create `credits` record if business
5. Return success

---


### delete-account

Delete user account and all associated data.

- **Path**: `supabase/functions/delete-account/index.ts`
- **Auth Required**: Yes
- **Parameters**: `{ confirm: boolean }`
- **Returns**: `{ success: boolean }`
- **Database**: Deletes from `profiles` (cascades to all related tables)
- **Called From**: `src/pages/DeleteAccount.tsx`

**Flow**:
1. Verify JWT
2. Verify confirmation
3. Delete from `profiles` (cascade deletes):
   - `business_info`
   - `reviews` (customer_id set NULL)
   - `responses`
   - `credits`, `credit_transactions`
   - `subscribers`
   - All other user data
4. Delete auth.users record
5. Log to `security_audit_log`
6. Return success

**Warning**: Irreversible operation

---


### verify-business-license

Verify business license number (external API lookup).

- **Path**: `supabase/functions/verify-business-license/index.ts`
- **Auth Required**: Yes
- **Parameters**: `{ license_number: string, state: string }`
- **Returns**: `{ valid: boolean, business_name?: string }`
- **External API**: State business license database
- **Database**: None (read-only lookup)
- **Called From**: `src/pages/BusinessVerification.tsx`

**Flow**:
1. Verify JWT
2. Call state API to verify license
3. Return validation result

---


## Admin Functions

### check-duplicates

Check for duplicate businesses or users.

- **Path**: `supabase/functions/check-duplicates/index.ts`
- **Auth Required**: Yes (Admin only)
- **Parameters**: `{ type: 'business' | 'user', search_field: string, search_value: string }`
- **Returns**: `{ duplicates: [] }`
- **Database**: Query `business_info` or `profiles`
- **Called From**: Admin dashboard

**Flow**:
1. Verify admin JWT
2. Search for duplicates based on type and field
3. Return matching records

**Use Cases**:
- Find duplicate business names
- Find duplicate license numbers
- Find duplicate emails/phones

---

### get-secret

Retrieve secret from Edge Function environment (admin utility).

- **Path**: `supabase/functions/get-secret/index.ts`
- **Auth Required**: Yes (Service role)
- **Parameters**: `{ secret_name: string }`
- **Returns**: `{ value: string }`
- **Database**: None
- **Called From**: Other Edge Functions (shared secret access)

**Flow**:
1. Verify service role
2. Return `Deno.env.get(secret_name)`
3. Used for sharing secrets between functions

---

## delete-review

Hard delete a review and all associated data with credit refunds.

- **Path**: `supabase/functions/delete-review/index.ts`
- **Auth Required**: Yes (JWT verified)
- **Parameters**: `{ reviewId: string }`
- **Returns**: `{ success: boolean, message: string }`
- **Database**: Deletes from `reviews`, `review_photos`, `review_reports`, `guest_access`, `user_review_notifications`, `customer_review_associations`
- **Credits**: Refunds credits to users who purchased access via `update_user_credits` RPC
- **Called From**: `src/pages/ReviewManagement.tsx`

**Flow**:
1. Verify JWT and ownership (business_id matches user)
2. Find all users who purchased access via `credit_transactions`
3. Process credit refunds (check for duplicates)
4. Delete associated data in order:
   - Review photos
   - Review reports
   - Guest access records
   - User review notifications
   - Customer review associations
5. Delete the review itself
6. Return success

**Credit Refund Logic**:
- Searches for `credit_transactions` with type='usage' matching review_id
- Refunds absolute value of credit amount
- Prevents duplicate refunds
- Uses service role client for refund operations

---

## handle-guest-access

Grant temporary guest access to a review after payment.

- **Path**: `supabase/functions/handle-guest-access/index.ts`
- **Auth Required**: Yes (JWT verified)
- **Parameters**: `{ sessionId: string, accessToken: string, reviewId: string }`
- **Returns**: `{ success: boolean, accessId?: string, expiresAt?: string }`
- **Stripe**: Verifies payment session is paid
- **Database**: Inserts into `guest_access` with 24-hour expiry
- **Called From**: Payment success flows

**Flow**:
1. Verify Stripe checkout session payment status
2. Check for duplicate access records
3. Create guest access record with 24-hour expiration
4. Return access ID and expiration time

---

## geocode-city

Geocode city and state to coordinates using Google Maps API.

- **Path**: `supabase/functions/geocode-city/index.ts`
- **Auth Required**: No
- **Parameters**: `{ city: string, state: string }`
- **Returns**: `{ coordinates: { lat: number, lng: number }, formatted_address: string }`
- **External API**: Google Maps Geocoding API (requires GOOGLE_MAPS_API_KEY)
- **Database**: None
- **Called From**: Location-based search features

**Flow**:
1. Validate city and state provided
2. Construct address string (city, state, USA)
3. Call Google Maps Geocoding API
4. Extract coordinates from first result
5. Return lat/lng and formatted address

---

## Functions Marked for Deletion

### get-twilio-info (OBSOLETE)

**Status**: Twilio no longer used

- **Path**: `supabase/functions/get-twilio-info/index.ts`
- **Reason**: Switched to AWS SNS for SMS, Resend for email
- **Action**: Delete this function (cannot delete via MCP)

### send-push-notification (OBSOLETE)

**Status**: Push notifications removed

- **Path**: `supabase/functions/send-push-notification/index.ts`
- **Reason**: Push notifications removed (see `docs/temp/13-push-notifications-removal.md`)
- **Action**: Delete this function (cannot delete via MCP)

### send-sms-verification (OBSOLETE)

**Status**: Twilio SMS sender

- **Path**: `supabase/functions/send-sms-verification/index.ts`
- **Reason**: Uses Twilio for SMS; replaced by verify-phone (AWS SNS)
- **Action**: Delete this function (cannot delete via MCP)

---

## Summary

**Total Functions**: 11 (9 user + 2 admin)
**Functions to Delete**: 3 (get-twilio-info, send-push-notification, send-sms-verification)

**User Management**:
- Profile CRUD operations
- Business info management
- Account deletion

**Admin Utilities**:
- Duplicate detection
- Secret management

**Database Tables Used**:
- `profiles` - User profiles
- `business_info` - Business information
- `reviews` - User reviews
- `customer_review_associations` - Anonymous review tracking
- `credits` - Credit balances

**Called From Frontend**:
- `src/pages/Profile.tsx` - Profile management
- `src/pages/BusinessProfile.tsx` - Business management
- `src/pages/MyReviews.tsx` - Review listing
- `src/pages/DeleteAccount.tsx` - Account deletion
- Admin dashboard - Admin functions

**Security**:
- JWT verification for all user operations
- Service role for admin functions
- Audit logging for sensitive operations (account deletion)
