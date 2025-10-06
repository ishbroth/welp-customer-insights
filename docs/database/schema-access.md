# Access Schema

Access control, guest access, business verification, and security audit logging.

## Tables in This Domain

1. `customer_access` - Customer access tokens for businesses
2. `guest_access` - Time-limited guest access to reviews
3. `verification_requests` - Business verification workflow
4. `security_audit_log` - Security event logging

---

## customer_access

Customer access tokens allowing businesses to grant specific customers access.

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| business_id | uuid | YES | NULL | Business granting access (links to profiles) |
| customer_id | uuid | YES | NULL | Customer receiving access (links to profiles) |
| expires_at | timestamptz | NO | - | Access expiration (UTC) |
| created_at | timestamptz | NO | now() | Access grant creation (UTC) |

### Constraints

- **Primary Key**: `id`
- **Foreign Key**: `business_id` → `profiles(id)` ON DELETE CASCADE
- **Foreign Key**: `customer_id` → `profiles(id)` ON DELETE CASCADE

### Indexes

- `business_id` (B-tree) - Lookup access grants for business
- `customer_id` (B-tree) - Lookup access grants for customer
- `expires_at` (B-tree) - Find expiring access

### RLS

- **Enabled**: Yes
- **Policies**:
  - Business owners can create/read/update access for their business
  - Customers can read their own access grants

### Purpose

Allows businesses to grant customers special access with time limits.

### Used In

- Access management features
- Customer access control

### Access Management

**Granting Access**:
1. Business selects customer
2. Insert into `customer_access`
3. Set `expires_at` for time-limited access

**Checking Access**:
```sql
SELECT * FROM customer_access
WHERE business_id = '...'
AND customer_id = '...'
AND expires_at > NOW();
```

### Related Tables

- **References**: `profiles(business_id)`, `profiles(customer_id)`
- **Referenced by**: None

---

## guest_access

Time-limited guest access to individual reviews via shareable links.

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| review_id | uuid | NO | - | Review accessible via this token |
| access_token | text | NO | - | Unique access token (unique) |
| stripe_session_id | text | YES | NULL | Stripe session if purchased |
| expires_at | timestamptz | NO | - | Token expiration (UTC) |
| created_at | timestamptz | NO | now() | Token creation (UTC) |

### Constraints

- **Primary Key**: `id`
- **Foreign Key**: `review_id` → `reviews(id)` ON DELETE CASCADE
- **Unique**: `access_token`

### Indexes

- `review_id` (B-tree) - Lookup guest access for review
- `access_token` (B-tree) - Fast token lookup
- `expires_at` (B-tree) - Cleanup expired tokens

### RLS

- **Enabled**: Yes
- **Policies**: Public can read with valid token; service role can create

### Purpose

Allows sharing reviews with non-authenticated users via time-limited links:
- Share review with stakeholders
- Customer support access
- Marketing/social sharing

### Used In

- Guest review access
- Review sharing features

### Guest Access Flow

1. Business/customer wants to share review
2. Generate access token → `guest_access`
3. Set `expires_at` (e.g., 24 hours, 7 days)
4. Return shareable URL: `https://app.com/guest/review?token=...`
5. Guest visits URL
6. Check token validity (not expired)
7. Display review to guest (read-only)

### Expiration

**Typical Durations**:
- 24 hours (default)
- 7 days (extended)
- 30 days (long-term)

**Security**: Tokens auto-expire. No need for manual revocation.

### Related Tables

- **References**: `reviews(review_id)`
- **Referenced by**: None

---

## verification_requests

Business verification workflow tracking.

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| user_id | uuid | NO | - | Business owner requesting verification |
| business_name | text | NO | - | Business name to verify |
| primary_license | text | NO | - | Primary license number |
| license_state | text | YES | NULL | State license was issued |
| license_type | text | YES | NULL | Type of license |
| business_type | text | NO | - | Type of business |
| business_subcategory | text | YES | NULL | Business subcategory |
| address | text | YES | NULL | Business address |
| city | text | YES | NULL | Business city |
| state | text | YES | NULL | Business state |
| zipcode | text | YES | NULL | Business ZIP code |
| phone | text | YES | NULL | Business phone |
| website | text | YES | NULL | Business website |
| additional_licenses | text | YES | NULL | Additional licenses |
| additional_info | text | YES | NULL | Additional information |
| verification_token | uuid | NO | gen_random_uuid() | Verification token |
| status | text | NO | 'pending' | Verification status |
| verified_at | timestamptz | YES | NULL | When verified (UTC) |
| created_at | timestamptz | NO | now() | Request submission (UTC) |

### Constraints

- **Primary Key**: `id`

### Indexes

- `user_id` (B-tree) - Lookup requests by user
- `status` (B-tree) - Filter pending requests
- `created_at` (B-tree) - Chronological ordering

### RLS

- **Enabled**: Yes
- **Policies**:
  - Users can create requests
  - Users can read their own requests
  - Admins can read/update all requests

### Purpose

Manages the business verification process:
1. Business owner submits verification request
2. Admin reviews business license/credentials
3. Admin approves/rejects request
4. If approved, business gets verified status

### Used In

- Business verification features

### Verification Workflow

**Submission**:
1. Business owner fills out verification form
2. Provides business name, license number
3. Insert into `verification_requests` (status = 'pending')
4. Send notification to admins

**Review**:
1. Admin reviews request
2. Verifies license number (external lookup)
3. Approves or rejects:
   - **Approved**: Update `status = 'approved'`, set `verified_at`
   - **Rejected**: Update `status = 'rejected'`
4. Email notification sent to business owner

### Related Tables

- **References**: None
- **Referenced by**: None

---

## security_audit_log

Security event logging for audit and compliance.

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| user_id | uuid | YES | NULL | User involved (if applicable) |
| event_type | text | NO | - | Type of security event |
| event_description | text | NO | - | Event description |
| ip_address | text | YES | NULL | IP address of event |
| user_agent | text | YES | NULL | User agent string |
| metadata | jsonb | YES | NULL | Additional event data |
| created_at | timestamptz | NO | now() | Event timestamp (UTC) |

### Constraints

- **Primary Key**: `id`
- **Foreign Keys**: None - `user_id` is nullable with no foreign key constraint

### Indexes

- `user_id` (B-tree) - Lookup events for user
- `created_at` (B-tree) - Chronological ordering
- `event_type` (B-tree) - Filter by event type

### RLS

- **Enabled**: Yes
- **Policies**: Service role only (no user access)

### Purpose

Comprehensive security event logging for:
- Security investigations
- Compliance requirements
- Threat detection
- User activity monitoring

### Event Types

**Authentication**:
- Login events
- Logout events
- Failed login attempts
- Password changes
- Email changes

**Account**:
- Account created
- Account deleted

**Security**:
- Suspicious activity
- Rate limit exceeded
- Access denied

### Used In

- Security monitoring and audit trail

### Related Tables

- **References**: None
- **Referenced by**: None

---

## Summary

**Total Tables**: 4

**Key Relationships**:
- `profiles` ← `customer_access.business_id` (one-to-many)
- `profiles` ← `customer_access.customer_id` (one-to-many)
- `reviews` ← `guest_access.review_id` (one-to-many)

**Access Control Patterns**:

**Customer Access**:
- Business grants customer ongoing access
- Check: valid, not expired

**Guest Access**:
- Time-limited, shareable link
- Check: valid token, not expired

**Business Verification**:
- One-time approval process
- Results in verified status

**Security Logging**:
- All security events logged
- Compliance and investigation

**Common Query Patterns**:
```sql
-- Check customer has access to business
SELECT * FROM customer_access
WHERE business_id = '...'
AND customer_id = '...'
AND expires_at > NOW();

-- Validate guest access token
SELECT ga.*, r.*
FROM guest_access ga
JOIN reviews r ON r.id = ga.review_id
WHERE ga.access_token = '...'
AND ga.expires_at > NOW();

-- Get pending verification requests
SELECT * FROM verification_requests
WHERE status = 'pending'
ORDER BY created_at ASC;

-- Find recent security events
SELECT * FROM security_audit_log
WHERE event_type = '...'
AND created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

See `constraints.md` for complete foreign key documentation.
