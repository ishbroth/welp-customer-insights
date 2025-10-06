# User & Admin Edge Functions

Profile management, account operations, and admin utilities.

## User Management Functions

### create-profile

Create user profile after signup.

- **Path**: `supabase/functions/create-profile/index.ts`
- **Auth Required**: No (uses service role internally)
- **Parameters**: `{ userId: string, name?: string, phone?: string, type: 'customer' | 'business', businessId?: string, licenseType?: string, verified?: boolean }`
- **Returns**: `{ success: boolean, message: string, data: object }`
- **Database**: Insert/update `profiles`, create/update `business_info` (if business type)
- **Called From**: Signup flow, profile update flow

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
- **Called From**: `src/hooks/useAccountDeletion.ts`, `src/utils/forceDeleteAccount.ts`

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
- **Called From**: Business verification flow (verify-business-license not currently in use)

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

Retrieve secret from Supabase Vault or environment variables.

- **Path**: `supabase/functions/get-secret/index.ts`
- **Auth Required**: No (uses service role internally)
- **Parameters**: `{ secretName: string }`
- **Returns**: `{ secret: string }`
- **Database**: Queries `vault.secrets` table, falls back to environment variables
- **Called From**: Other Edge Functions (shared secret access)

**Flow**:
1. Try to retrieve from Supabase Vault (`vault.secrets`)
2. If not found, fall back to `Deno.env.get(secretName)`
3. Return secret value or error
4. Used for sharing secrets between functions

---

## delete-review

Hard delete a review and all associated data with credit refunds.

- **Path**: `supabase/functions/delete-review/index.ts`
- **Auth Required**: Yes (JWT verified)
- **Parameters**: `{ reviewId: string }`
- **Returns**: `{ success: boolean, message: string }`
- **Database**: Deletes from `reviews`, `review_photos`, `review_reports`, `guest_access`, `user_review_notifications`, `customer_review_associations`
- **Credits**: Refunds credits to users who purchased access via `update_user_credits` RPC
- **Called From**: `src/hooks/useBusinessReviews.ts`

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

## Functions Marked as Obsolete

The following functions are still deployed but are no longer used in the application. They should be deleted manually via the Supabase Dashboard (cannot be deleted via MCP).

### get-twilio-info (OBSOLETE - NOT IN USE)

**Status**: Deployed but unused

- **Path**: `supabase/functions/get-twilio-info/index.ts`
- **Reason**: Twilio integration removed; replaced with AWS SNS for SMS and Resend for email
- **Action**: Safe to delete this function manually via Supabase Dashboard

### send-push-notification (OBSOLETE - NOT IN USE)

**Status**: Deployed but unused

- **Path**: `supabase/functions/send-push-notification/index.ts`
- **Reason**: Push notification functionality removed from the application (see `docs/temp/13-push-notifications-removal.md`)
- **Action**: Safe to delete this function manually via Supabase Dashboard

### send-sms-verification (OBSOLETE - NOT IN USE)

**Status**: Deployed but unused

- **Path**: `supabase/functions/send-sms-verification/index.ts`
- **Reason**: Twilio SMS sender; replaced by verify-phone function which uses AWS SNS
- **Action**: Safe to delete this function manually via Supabase Dashboard

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
