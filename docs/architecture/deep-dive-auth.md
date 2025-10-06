# Deep Dive: Authentication & User Management

## Overview
Welp uses a custom email verification flow built on top of Supabase Auth. Phone verification was planned but is NOT implemented.

## Customer Signup Flow

### User Journey
1. Navigate to `/signup?type=customer`
2. Fill form: First/last name, email, phone, address, password
3. Click "Continue to Email Verification"
4. Receive 6-digit code via email (Resend)
5. Enter code on verification screen
6. Account created + auto sign-in
7. Redirect to `/email-verification-success`
8. Account is VERIFIED and ready to use

### Frontend Implementation

**Page**: `src/pages/Signup.tsx`
- Renders tabs for Business vs Customer
- Query param `?type=customer` sets initial tab
- Passes step state to child forms

**Form Component**: `src/components/signup/CustomerSignupForm.tsx`
- **State**: firstName, lastName, email, phone, address, city, state, zipCode, password
- **Step 1** (Form):
  - Validates required fields (line 70-125)
  - Checks for duplicate accounts via `useCustomerDuplicateCheck` hook
  - Sends verification code via `sendEmailVerificationCode()` utility
  - Transitions to step 2 on success
- **Step 2** (Verification):
  - Renders `EmailVerificationCodeInput` (6-digit OTP input)
  - Uses `useEmailVerification` hook for code verification
  - Shows resend button with 60-second cooldown

**Hooks**:
- `src/hooks/useCustomerDuplicateCheck.ts` - Checks if email/phone already exists
- `src/hooks/useEmailVerification.ts` - Handles code verification & account creation
  - Line 80-163: `handleVerifyCode()` function
  - Calls `verifyEmailCode()` utility
  - Clears existing session (line 115)
  - Sets new session tokens (line 118-123)
  - Navigates to success page

**Utilities**:
- `src/utils/emailUtils.ts`
  - `sendEmailVerificationCode({ email })` - Calls `send-email-verification-code` edge function
  - `verifyEmailCode(email, code, accountType, userData)` - Calls `verify-email-code` edge function

### Backend Implementation

**Edge Function 1**: `supabase/functions/send-email-verification-code/index.ts`
1. Generates random 6-digit code
2. Stores in `email_verification_codes` table with 10-minute expiry
3. Sends email via Resend API
4. Returns success/failure

**Edge Function 2**: `supabase/functions/verify-email-code/index.ts` (CRITICAL)
1. **Check code validity** (line 31-80):
   - Query `email_verification_codes` for matching unused code
   - Check `expires_at >= now()`
   - Return error messages if expired or used

2. **Check existing user** (line 85-98):
   - Query `auth.users` for existing account with email
   - If found, use existing user ID
   - If not found, create new user

3. **Create user** (line 100-130):
   - `supabaseAdmin.auth.admin.createUser()`
   - Set `email_confirm: true` (skip email confirmation)
   - Set `user_metadata` with name, phone, accountType

4. **Create profile** (line 133-162):
   - Upsert to `profiles` table
   - Set `type: 'customer'`
   - Set `verified: true` (customers are verified after email confirmation)
   - Include name, email, phone, address, city, state, zipcode

5. **Mark code as used** (line 191-199):
   - Update `email_verification_codes.used = true`
   - Prevents code reuse

6. **Auto sign-in** (line 202-230):
   - Sign out existing session (line 209)
   - `supabase.auth.signInWithPassword(email, password)`
   - Return session tokens to client
   - Client stores tokens in Supabase Auth

### Database Tables

**email_verification_codes**
```sql
id (uuid, PK)
email (text)
code (text, 6 digits)
created_at (timestamp)
expires_at (timestamp, created_at + 10 minutes)
used (boolean, default false)
```

**profiles**
```sql
id (uuid, PK, FK to auth.users)
email (text)
type (text, 'customer' | 'business' | 'admin')
name (text)
first_name (text)
last_name (text)
phone (text)
address (text)
city (text)
state (text)
zipcode (text)
verified (boolean)
created_at (timestamp)
updated_at (timestamp)
```

### Email Sent
- **From**: `noreply@trustyreview.com` (or configured Resend domain)
- **Subject**: "Your Welp Verification Code"
- **Body**: Contains 6-digit code
- **Provider**: Resend API (NOT Twilio)

---

## Business Signup Flow

### User Journey
1. Navigate to `/signup?type=business`
2. Fill form: Business name, email, phone, address, license info, password
3. Real-time license verification attempts (as user types license #)
4. Click "Submit"
5. **If license verified**:
   - Receive email verification code
   - Enter code
   - Account created with `verified: true` badge
   - Redirect to success page
6. **If license NOT verified**:
   - Email verification code sent
   - Enter code
   - Account created with `verified: false`
   - Can submit manual verification request later

### Frontend Implementation

**Page**: `src/pages/Signup.tsx` (same as customer)

**Form Component**: `src/components/signup/BusinessSignupForm.tsx`
- Delegates to `BusinessVerificationStep` component
- Uses `useBusinessAccountCreation` hook for email verification
- Uses `useRealTimeLicenseVerification` hook for live license checks

**Verification Component**: `src/components/signup/BusinessVerificationStep.tsx`
- Multi-section form:
  - `BusinessTypeFields` - Business type dropdown
  - `BasicLicenseFields` - License number + state
  - `BusinessContactFields` - Email, phone
  - `BusinessAddressFields` - Street, city, state, zip
  - `BusinessPasswordSection` - Password + confirm
- Real-time duplicate checking via `useDuplicateCheck` hook
- Shows instant feedback if license verifies

**Hooks**:
- `src/hooks/useBusinessVerification.ts` - Main verification logic
  - `performBusinessVerification()` function (line 18-127)
  - Calls `verifyBusinessId()` utility
  - If verified: stores verification data in sessionStorage
  - If not verified: creates unverified account immediately

- `src/hooks/useRealTimeLicenseVerification.ts` - Live license checking
  - Debounced API calls as user types
  - Shows green checkmark when verified

- `src/hooks/useBusinessAccountCreation.ts` - Email verification flow
  - Similar to customer flow but includes business_info table

**Utilities**:
- `src/utils/businessVerification.ts`
  - `verifyBusinessId(licenseNumber, businessType, state)` - Calls external license API
  - Returns: `{ verified: boolean, isRealVerification: boolean, details: {...} }`

### Backend Implementation

**Edge Function**: `supabase/functions/verify-email-code/index.ts` (SAME as customer)
- Account type detection via `accountType` param
- For business accounts (line 167-188):
  - Creates `business_info` record
  - Sets `business_name`, `license_number`, `license_type`, `license_state`
  - Sets `verified: true` ONLY if `userData.licenseVerificationResult.verified && isRealVerification`
  - Otherwise `verified: false`

### Database Tables

**business_info**
```sql
id (uuid, PK, FK to profiles.id)
business_name (text)
license_number (text)
license_type (text)
license_state (text)
license_status (text, 'verified' | 'pending' | 'rejected')
license_expiration (date, nullable)
verified (boolean)
website (text, nullable)
additional_info (text, nullable)
```

### License Verification

**Real Verification** (when API succeeds):
- External API lookup via `verifyBusinessId()`
- Checks state licensing database
- Returns license status, expiration, issuing authority
- Business immediately gets verified badge

**Manual Verification** (fallback):
- User submits verification request
- Stored in `verification_requests` table
- Admin reviews via `/admin-verify-business` page
- Admin calls `verify-business` edge function to approve/reject

---

## Login Flow

### User Journey
1. Navigate to `/login`
2. Enter email + password
3. Click "Login"
4. If successful: Redirect to `/profile` (or intended destination)
5. If failed: Show error message

### Frontend Implementation

**Page**: `src/pages/Login.tsx`
- Form with email + password fields
- "Forgot Password?" link → `/forgot-password`
- Uses `useSecureAuth` hook

**Hook**: `src/contexts/auth/hooks/useSecureAuth.ts`
- `login(email, password)` function
- Calls `supabase.auth.signInWithPassword()`
- On success: Updates auth context
- On error: Rate limit check, show toast

### Backend
- Supabase Auth handles login
- No custom edge function needed
- Rate limiting via `check_rate_limit()` RPC function

---

## Password Reset Flow

### User Journey
1. Click "Forgot Password?" on login page
2. Navigate to `/forgot-password`
3. Enter email address
4. Receive reset link via email
5. Click link → redirected to `/reset-password?token=...`
6. Enter new password
7. Password updated, redirect to login

### Frontend Implementation

**Page**: `src/pages/ForgotPassword.tsx`
- Email input form
- Calls `supabase.auth.resetPasswordForEmail(email)`
- Shows success message

**Page**: `src/pages/ResetPassword.tsx`
- New password + confirm password fields
- Extracts token from URL params
- Calls `supabase.auth.updateUser({ password: newPassword })`
- Redirects to login on success

### Backend
- Handled by Supabase Auth
- Sends email via Supabase's email provider
- Token embedded in email link

---

## Session Management

### Session Creation
- JWT access token (short-lived, ~1 hour)
- Refresh token (long-lived, ~30 days)
- Stored in httpOnly cookies (when using Supabase Hosted Auth)
- Local storage fallback (when using custom domain)

### Session Refresh
- Automatic via `supabase.auth.onAuthStateChange()` listener
- Located in `src/contexts/auth/AuthProvider.tsx`
- Calls `supabase.auth.refreshSession()` when access token expires

### Session Persistence
- Stored in browser local storage
- Survives page refresh
- Cleared on logout

### Session Validation
- Every request includes JWT in `Authorization: Bearer <token>` header
- Supabase validates token server-side
- RLS policies enforce user-level access control

---

## Auth Context

### Location
`src/contexts/auth/AuthProvider.tsx`

### State
```typescript
{
  currentUser: Profile | null,
  loading: boolean,
  isAdmin: boolean,
  isBusiness: boolean,
  isCustomer: boolean,
  isSubscribed: boolean
}
```

### Methods
- `login(email, password)` - Sign in
- `logout()` - Sign out + redirect to home
- `signup(userData)` - Register new account
- `updateProfile(data)` - Update profile info

### Hooks
- `src/contexts/auth/hooks/useAuthStateManagement.ts` - Manages auth state changes
- `src/contexts/auth/hooks/useUserInitialization.ts` - Loads user profile on auth
- `src/contexts/auth/hooks/useSubscriptionStatus.ts` - Checks subscription status
- `src/contexts/auth/hooks/useAccessControl.ts` - Permission checks

### Usage
```typescript
const { currentUser, isAdmin, login, logout } = useAuth();
```

---

## Protected Routes

### Implementation
`src/components/routing/PrivateRoute.tsx`

### Logic
- Checks if `currentUser` exists
- If not authenticated: Redirect to `/login`
- Preserves intended destination in URL params
- After login: Redirect to intended destination

### Usage
```typescript
<Route path="/profile" element={
  <PrivateRoute>
    <ProfilePage />
  </PrivateRoute>
} />
```

### Route Variations
- `PrivateRoute` - Any authenticated user
- `BusinessOrAdminRoute` - Business or admin only
- `BusinessOwnerRoute` - Business owner only (for specific resource)

---

## Account Types & Permissions

### Customer
- Can: View reviews about them, claim reviews, start conversations
- Cannot: Write reviews, verify businesses

### Business
- Can: Write reviews, respond to reviews (if unlocked), search customers
- Cannot: See reviews without unlocking (credit or subscription)

### Admin
- Can: Everything + verify businesses, view all data, manage users
- Special admin login: `/admin-login`

---

## Duplicate Account Prevention

### Customer Duplicates
**Hook**: `src/hooks/useCustomerDuplicateCheck.ts`

**Checks**:
1. Email existence: Query `profiles` where `email = ? AND type = 'customer'`
2. Phone existence: Query `profiles` where `phone = ? AND type = 'customer'`

**Behavior**:
- If email exists: Block signup, show "Email already in use"
- If phone exists: Show warning, allow continuation (phone not unique across all users)

### Business Duplicates
**Hook**: `src/hooks/useDuplicateCheck.ts`

**Checks**:
1. Email existence
2. License number existence: Query `business_info` where `license_number = ?`

**Behavior**:
- If email exists: Block signup
- If license exists: Block signup (one account per license)

---

## Rate Limiting

### Database Function
`check_rate_limit(identifier, attempt_type, max_attempts, window_minutes, block_minutes)`

### Usage
```sql
SELECT check_rate_limit('user@example.com', 'login', 5, 15, 60);
-- Returns: false (blocked) if >5 attempts in last 15 min
-- Blocks for 60 minutes after threshold
```

### Attempt Types
- `login` - Login attempts
- `password_reset` - Password reset requests
- `email_verification` - Verification code requests

### Table
`auth_rate_limits`
- Tracks attempts per identifier (email/phone)
- Auto-cleanup of old records

---

## Security Measures

### Password Requirements
- Minimum 8 characters
- Validated client-side (line 109-116 in CustomerSignupForm.tsx)
- Hashed by Supabase Auth (bcrypt)

### Email Verification
- Required for all accounts
- Codes expire after 10 minutes
- Codes can only be used once
- Protection against brute-force (rate limiting)

### Session Security
- JWT tokens with short expiry
- Refresh tokens stored securely
- HTTPS required in production

### Audit Logging
- Login attempts logged to `security_audit_log`
- Failed login attempts logged
- Account creation logged
- Includes IP address + user agent

---

## Common Issues & Solutions

### Issue: Email verification code expired
**Solution**: Resend code button, new code generated, old code marked as used

### Issue: Account already exists
**Solution**: Show login link, suggest password reset

### Issue: License verification fails
**Solution**: Create unverified account, offer manual verification

### Issue: User logged out unexpectedly
**Solution**: Check token expiry, refresh session automatically

### Issue: Duplicate accounts
**Solution**: Pre-signup duplicate checks block creation
