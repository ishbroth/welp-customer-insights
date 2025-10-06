# Authentication Schema

Email and phone verification systems, rate limiting, account lockout, and session management.

## Tables in This Domain

1. `verification_codes` - Phone verification OTP codes
2. `email_verification_codes` - Email verification OTP codes
3. `auth_rate_limits` - Rate limiting for authentication operations
4. `user_sessions` - Active user sessions
5. `account_lockout` - Account lockout tracking (not actively used)

---

## verification_codes

Phone verification OTP codes sent via Resend email.

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| phone | text | YES | NULL | Phone number being verified (unique) |
| email | text | YES | NULL | Email to send code to |
| code | text | NO | - | Verification code |
| verification_type | text | NO | 'phone' | Type of verification |
| created_at | timestamptz | NO | now() | Code creation (UTC) |
| expires_at | timestamptz | NO | - | Expiration time (UTC) |
| max_attempts | integer | YES | 3 | Maximum verification attempts |
| attempt_count | integer | YES | 0 | Current number of attempts |

### Constraints

- **Primary Key**: `id`
- **Unique**: `phone` (unique constraint exists)

### Indexes

- `phone` (B-tree) - Lookup codes for phone number
- `expires_at` (B-tree) - Cleanup expired codes

### RLS

- **Enabled**: Yes
- **Policies**: Users can verify their own codes

### Expiration

Codes expire based on `expires_at` field.

### Used In

- `src/components/signup/PhoneVerificationFlow.tsx` - Phone verification UI
- `src/hooks/usePhoneVerification.ts` - Phone verification logic

### Security

- **Rate Limiting**: Via `auth_rate_limits` table
- **Max Attempts**: Configurable via `max_attempts` column
- **Cleanup**: Expired codes should be purged regularly

### Related Tables

- **References**: None
- **Referenced by**: None

---

## email_verification_codes

Email verification OTP codes sent via Resend.

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| email | text | NO | - | Email address being verified (unique) |
| code | text | NO | - | 6-digit OTP code |
| created_at | timestamptz | NO | now() | Code creation (UTC) |
| expires_at | timestamptz | NO | - | Expiration time (UTC) |
| used | boolean | NO | false | Whether code was successfully used |

### Constraints

- **Primary Key**: `id`
- **Unique**: `email`

### Indexes

- `email` (B-tree) - Lookup codes for email
- `expires_at` (B-tree) - Cleanup expired codes

### RLS

- **Enabled**: Yes
- **Policies**: Users can verify their own email codes

### Used In

- `src/hooks/useEmailVerification.ts` - Email verification logic

### Related Tables

- **References**: None
- **Referenced by**: None

---

## auth_rate_limits

Rate limiting for authentication operations to prevent brute force attacks.

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| identifier | text | NO | - | IP address or user identifier |
| attempt_type | text | NO | - | Action being rate limited |
| attempts | integer | NO | 1 | Number of attempts |
| first_attempt_at | timestamptz | NO | now() | First attempt timestamp (UTC) |
| last_attempt_at | timestamptz | NO | now() | Most recent attempt (UTC) |
| blocked_until | timestamptz | YES | NULL | Block expiration (UTC) |
| created_at | timestamptz | NO | now() | Record creation (UTC) |

### Constraints

- **Primary Key**: `id`

### Actions Tracked

- Phone verification attempts
- Email verification attempts
- Login attempts
- Signup attempts

### RLS

- **Enabled**: Yes
- **Policies**: Service role only (not user-accessible)

### Used In

- Rate limit checking before auth operations

### Cleanup

Rate limit windows reset after configured time period.

### Related Tables

- **References**: None
- **Referenced by**: None

---

## user_sessions

Active user sessions for tracking logged-in users.

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| user_id | uuid | YES | NULL | User who owns this session (links to auth.users) |
| last_login | timestamptz | YES | now() | Last login timestamp (UTC) |
| created_at | timestamptz | YES | now() | Session creation (UTC) |

### Constraints

- **Primary Key**: `id`
- **Foreign Key**: `user_id` → `auth.users(id)` ON DELETE CASCADE

### Indexes

- `user_id` (B-tree) - Lookup sessions for user

### RLS

- **Enabled**: Yes
- **Policies**: Users can read their own sessions

### Used In

- Session management features

### Session Management

- **Creation**: On login
- **Update**: On activity (last_login updated)
- **Cleanup**: Old sessions can be purged

### Related Tables

- **References**: `auth.users(user_id)`
- **Referenced by**: None

---

## account_lockout

Account lockout tracking for preventing unauthorized access attempts.

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| identifier | text | NO | - | IP address or user identifier being locked |
| lockout_type | text | NO | - | Type of lockout (e.g., 'login', 'verification') |
| locked_until | timestamptz | NO | - | When lockout expires (UTC) |
| attempts | integer | NO | 0 | Number of failed attempts |
| created_at | timestamptz | NO | now() | Lockout creation (UTC) |

### Constraints

- **Primary Key**: `id`
- **Unique**: `(identifier, lockout_type)` (one lockout record per identifier/type combination)
- **Foreign Keys**: None

### Indexes

- Unique composite index on `(identifier, lockout_type)`

### RLS

- **Enabled**: Yes
- **Policies**: Service role only (not user-accessible)

### Purpose

This table provides enhanced account lockout functionality to prevent brute force attacks. When an identifier (IP address or user) exceeds the maximum number of failed authentication attempts, they are locked out until the `locked_until` timestamp expires.

### Status

**Currently Not Actively Used**

The table exists in the database and has a corresponding `check_rate_limit_with_lockout()` function, but the current authentication flow uses the simpler `auth_rate_limits` table instead. This table is reserved for future enhanced security features.

### Used In

- Reserved for future use

### Related Tables

- **References**: None
- **Referenced by**: None

---

## Summary

**Total Tables**: 5 (4 actively used, 1 reserved)

**Key Relationships**:
- `auth.users` ← `user_sessions.user_id` (one-to-many)

**Security Recommendations**:
1. Regular cleanup of expired codes and sessions
2. Monitor rate limits for suspicious patterns
3. Implement proper lockout thresholds

**Common Query Patterns**:
```sql
-- Check if phone has valid code
SELECT * FROM verification_codes
WHERE phone = '...'
AND expires_at > NOW()
ORDER BY created_at DESC
LIMIT 1;

-- Get active sessions for user
SELECT * FROM user_sessions
WHERE user_id = '...'
ORDER BY last_login DESC;
```

See `constraints.md` for complete foreign key documentation.
