# Row Level Security (RLS) Policies

All 28 tables have RLS enabled. This document describes the access control policies for each table.

## RLS Status Overview

**All tables**: ✅ RLS Enabled

RLS enforces access control at the database level, preventing unauthorized data access even if application code has bugs.

---

## Core Tables

### profiles

**RLS Enabled**: ✅ Yes

**Policies**:
- **Read**: Users can read their own profile
- **Update**: Users can update their own profile
- **Service Role**: Full access for administrative operations

**Implementation**:
```sql
-- Users can read own profile
auth.uid() = id

-- Users can update own profile
auth.uid() = id
```

**Public Access**: No (profiles are private)

---

### business_info

**RLS Enabled**: ✅ Yes

**Policies**:
- **Read**: All authenticated users can read all business_info (public directory)
- **Create**: Business users can create their own business_info
- **Update**: Business owners can update their own business_info
- **Delete**: Business owners can delete their own business_info

**Implementation**:
```sql
-- Anyone authenticated can read
auth.role() = 'authenticated'

-- Owner can modify
auth.uid() = user_id
```

**Public Access**: Yes (for authenticated users - business directory)

---

### reviews

**RLS Enabled**: ✅ Yes

**Policies**:
- **Read**:
  - Business owners can read reviews about their business
  - Customers can read their own reviews
  - Reviews can be read via guest_access token
  - Authenticated users can read public reviews
- **Create**: Authenticated users can create reviews
- **Update**: Review author can update their own review
- **Delete**: Review author or business owner (with approval) can delete

**Implementation**:
```sql
-- Business owner can read reviews about their business
auth.uid() IN (
  SELECT user_id FROM business_info WHERE id = business_id
)

-- Customer can read own reviews
auth.uid() = customer_id

-- Anyone can read via customer_review_associations (anonymous reviews)
auth.uid() IN (
  SELECT customer_id FROM customer_review_associations WHERE review_id = id
)
```

**Public Access**: Partial (authenticated users can view, guest access via token)

---

### responses

**RLS Enabled**: ✅ Yes

**Policies**:
- **Read**: Anyone can read responses (they're public)
- **Create**: Business owners can respond to reviews about their business
- **Update**: Response author can update their own response
- **Delete**: Response author can delete their own response

**Implementation**:
```sql
-- Anyone authenticated can read
auth.role() = 'authenticated'

-- Business owner can create response to review about their business
auth.uid() IN (
  SELECT user_id FROM business_info
  WHERE id = (SELECT business_id FROM reviews WHERE id = review_id)
)

-- Response author can modify
auth.uid() = user_id
```

**Public Access**: Yes (responses are public)

---

### review_photos

**RLS Enabled**: ✅ Yes

**Policies**:
- **Read**: Anyone can view photos for accessible reviews
- **Create**: Review author can upload photos to their review
- **Delete**: Review author can delete their photos

**Implementation**:
```sql
-- Anyone can read photos for accessible reviews
review_id IN (SELECT id FROM reviews) -- Leverages reviews RLS

-- Review author can create/delete
auth.uid() IN (
  SELECT customer_id FROM reviews WHERE id = review_id
  UNION
  SELECT customer_id FROM customer_review_associations WHERE review_id = review_id
)
```

**Public Access**: Yes (via reviews access)

---

## Authentication Tables

### verification_codes

**RLS Enabled**: ✅ Yes

**Policies**:
- **Read**: Service role only (codes are sensitive)
- **Create**: Service role only
- **Update**: Service role only (for marking as verified)

**Implementation**:
```sql
-- Service role only
false -- No user access, service role bypasses RLS
```

**Public Access**: No (verification codes are sensitive)

---

### email_verification_codes

**RLS Enabled**: ✅ Yes

**Policies**:
- **Read**: Users can read codes for their own email
- **Create**: Service role only
- **Update**: Service role only

**Implementation**:
```sql
-- User can read codes for their email
email = (SELECT email FROM profiles WHERE id = auth.uid())
OR
user_id = auth.uid()
```

**Public Access**: No

---

### auth_rate_limits

**RLS Enabled**: ✅ Yes

**Policies**:
- **All operations**: Service role only

**Implementation**:
```sql
-- Service role only
false
```

**Public Access**: No

---

### account_lockout

**RLS Enabled**: ✅ Yes

**Policies**:
- **All operations**: Service role only

**Implementation**:
```sql
-- Service role only
false
```

**Public Access**: No

---

### user_sessions

**RLS Enabled**: ✅ Yes

**Policies**:
- **Read**: Users can read their own sessions
- **Create/Update/Delete**: Service role only

**Implementation**:
```sql
-- User can read own sessions
auth.uid() = user_id
```

**Public Access**: No

---

## Billing Tables

### credits

**RLS Enabled**: ✅ Yes

**Policies**:
- **Read**: Users can read their own credit balance
- **Create/Update**: Service role only (prevent tampering)

**Implementation**:
```sql
-- User can read own credits
auth.uid() = user_id
```

**Public Access**: No

---

### credit_transactions

**RLS Enabled**: ✅ Yes

**Policies**:
- **Read**: Users can read their own transactions
- **Create**: Service role only
- **Update/Delete**: Not allowed

**Implementation**:
```sql
-- User can read own transactions
auth.uid() = user_id
```

**Public Access**: No

---

### subscriptions

**RLS Enabled**: ✅ Yes

**Policies**:
- **Read**: Users can read subscriptions they're linked to (via subscribers table)
- **Create/Update**: Service role only (Stripe webhook updates)

**Implementation**:
```sql
-- User can read subscriptions they're linked to
id IN (
  SELECT subscription_id FROM subscribers WHERE user_id = auth.uid()
)
```

**Public Access**: No

---

### subscribers

**RLS Enabled**: ✅ Yes

**Policies**:
- **Read**: Users can read their own subscription relationships
- **Create/Update/Delete**: Service role only

**Implementation**:
```sql
-- User can read own subscriptions
auth.uid() = user_id
```

**Public Access**: No

---

## Notification Tables

### notification_preferences

**RLS Enabled**: ✅ Yes

**Policies**:
- **Read**: Users can read their own preferences
- **Update**: Users can update their own preferences
- **Create**: Automatically created on signup

**Implementation**:
```sql
-- User can read/update own preferences
auth.uid() = user_id
```

**Public Access**: No

---

### notifications_log

**RLS Enabled**: ✅ Yes

**Policies**:
- **Read**: Users can read their own notification history
- **Create**: Service role only
- **Update/Delete**: Not allowed (immutable log)

**Implementation**:
```sql
-- User can read own notifications
auth.uid() = user_id
```

**Public Access**: No

---

### device_tokens

**RLS Enabled**: ✅ Yes

**Policies**:
- **All operations**: Service role only (currently unused)

**Implementation**:
```sql
-- Service role only
false
```

**Public Access**: No

---

### user_review_notifications

**RLS Enabled**: ✅ Yes

**Policies**:
- **All operations**: Service role only (deduplication tracking)

**Implementation**:
```sql
-- Service role only
false
```

**Public Access**: No

---

## Review Management Tables

### review_claims

**RLS Enabled**: ✅ Yes

**Policies**:
- **Read**:
  - Business owners can read their own claims
  - Admins can read all claims
- **Create**: Business owners can create claims
- **Update**: Admins only

**Implementation**:
```sql
-- Business owner can read own claims
auth.uid() IN (
  SELECT user_id FROM business_info WHERE id = business_id
)

-- Admin can read all (if admin role implemented)
-- Currently via service role
```

**Public Access**: No

---

### review_claim_history

**RLS Enabled**: ✅ Yes

**Policies**:
- **Read**: Business owners can read history for their claims
- **Create**: Service role only
- **Update/Delete**: Not allowed (immutable audit trail)

**Implementation**:
```sql
-- Business owner can read history for their claims
claim_id IN (
  SELECT rc.id FROM review_claims rc
  JOIN business_info bi ON bi.id = rc.business_id
  WHERE bi.user_id = auth.uid()
)
```

**Public Access**: No

---

### review_reports

**RLS Enabled**: ✅ Yes

**Policies**:
- **Read**:
  - Users can read their own reports
  - Admins can read all reports
- **Create**: Authenticated users can create reports
- **Update**: Admins only

**Implementation**:
```sql
-- User can read own reports
auth.uid() = reported_by

-- Create: authenticated users
auth.role() = 'authenticated'
```

**Public Access**: No

---

### customer_review_associations

**RLS Enabled**: ✅ Yes

**Policies**:
- **Read**: Users can read their own associations
- **Create**: Service role only
- **Update/Delete**: Not allowed

**Implementation**:
```sql
-- User can read own associations
auth.uid() = customer_id
```

**Public Access**: No

---

## Conversation Tables

### review_conversations

**RLS Enabled**: ✅ Yes

**Policies**:
- **Read**: Conversation participants only (via conversation_participants table)
- **Create**: Participants can send messages
- **Update**: Message sender can edit their own message
- **Delete**: Message sender can delete their own message

**Implementation**:
```sql
-- Participant can read
auth.uid() IN (
  SELECT user_id FROM conversation_participants WHERE review_id = review_id
)

-- Sender can modify own message
auth.uid() = sender_id
```

**Public Access**: No (private conversations)

---

### conversation_participants

**RLS Enabled**: ✅ Yes

**Policies**:
- **Read**: Users can read if they are a participant
- **Create**: Service role only
- **Update/Delete**: Service role only

**Implementation**:
```sql
-- User can read if they're a participant
auth.uid() = user_id
```

**Public Access**: No

---

## Access Control Tables

### customer_access

**RLS Enabled**: ✅ Yes

**Policies**:
- **Read**:
  - Business owners can read access grants for their business
  - Customers can read their own access grants
- **Create**: Business owners can grant access
- **Update**: Business owners can revoke access
- **Delete**: Business owners can delete access grants

**Implementation**:
```sql
-- Business owner can manage
auth.uid() IN (
  SELECT user_id FROM business_info WHERE id = business_id
)

-- Customer can read own grants
auth.uid() = customer_id
```

**Public Access**: No

---

### guest_access

**RLS Enabled**: ✅ Yes

**Policies**:
- **Read**: Anyone with valid access_token can read
- **Create**: Service role only
- **Update**: Service role only (access tracking)

**Implementation**:
```sql
-- Public can read with valid token
-- Token validation done in application layer
true -- Read allowed, token validation in app
```

**Public Access**: Yes (with valid token)

---

### verification_requests

**RLS Enabled**: ✅ Yes

**Policies**:
- **Read**:
  - Users can read their own verification requests
  - Admins can read all requests
- **Create**: Users can create verification requests
- **Update**: Admins only

**Implementation**:
```sql
-- User can read own requests
auth.uid() = user_id

-- User can create
auth.role() = 'authenticated'
```

**Public Access**: No

---

### security_audit_log

**RLS Enabled**: ✅ Yes

**Policies**:
- **All operations**: Service role only

**Implementation**:
```sql
-- Service role only
false
```

**Public Access**: No (security sensitive)

---

## RLS Policy Patterns

### Pattern 1: Own Data Access
Used by most user-specific tables:
```sql
auth.uid() = user_id
```

Tables: profiles, credits, credit_transactions, notification_preferences, notifications_log, user_sessions, etc.

### Pattern 2: Business Owner Access
For business-related data:
```sql
auth.uid() IN (
  SELECT user_id FROM business_info WHERE id = business_id
)
```

Tables: reviews (for business owner), responses, customer_access, review_claims

### Pattern 3: Service Role Only
For sensitive or system-managed data:
```sql
false -- Users cannot access, service role bypasses RLS
```

Tables: auth_rate_limits, account_lockout, device_tokens, user_review_notifications, security_audit_log

### Pattern 4: Public Read
For directory/public data:
```sql
auth.role() = 'authenticated' -- Any authenticated user
```

Tables: business_info (read), responses (read)

### Pattern 5: Participant Access
For collaborative features:
```sql
auth.uid() IN (
  SELECT user_id FROM conversation_participants WHERE review_id = review_id
)
```

Tables: review_conversations

### Pattern 6: Junction Table Access
For many-to-many relationships:
```sql
-- Via customer_review_associations for anonymous reviews
auth.uid() IN (
  SELECT customer_id FROM customer_review_associations WHERE review_id = id
)
```

Tables: reviews (anonymous review access)

---

## Testing RLS Policies

**Manual Testing**:
1. Create test users with different roles
2. Attempt unauthorized access
3. Verify access denied
4. Verify authorized access succeeds

**Automated Testing**:
```sql
-- Test user can't read other user's data
SET request.jwt.claim.sub = 'user-1-id';
SELECT * FROM profiles WHERE id = 'user-2-id'; -- Should return 0 rows

-- Test user can read own data
SET request.jwt.claim.sub = 'user-1-id';
SELECT * FROM profiles WHERE id = 'user-1-id'; -- Should return 1 row
```

**Edge Function Testing**:
- Service role bypasses RLS (full access)
- Test with user JWT for user-level access

---

## RLS Performance Considerations

**Indexed Columns**: All columns used in RLS policies should be indexed
- ✅ `user_id` indexed on all tables
- ✅ `review_id` indexed where used
- ✅ `business_id` indexed where used

**Policy Complexity**: Keep policies simple for performance
- Avoid nested subqueries where possible
- Use indexes for JOIN conditions
- Consider materialized views for complex access patterns

**Service Role**: Use service role for batch operations (bypasses RLS)

---

## Security Audit Recommendations

**Current Status**: All 28 tables have RLS enabled ✅

**Recommended Audits**:
1. Review RLS policies quarterly
2. Test policies with penetration testing
3. Monitor for RLS bypass attempts in security_audit_log
4. Verify new tables have RLS enabled before deployment
5. Document any policy changes in this file

**Common Vulnerabilities to Avoid**:
- ❌ Forgetting to enable RLS on new tables
- ❌ Overly permissive policies (e.g., `true` for all operations)
- ❌ Logic bugs in complex policies
- ❌ Not testing with actual user JWTs
- ❌ Exposing sensitive data via joins

**Best Practices**:
- ✅ Enable RLS on all tables
- ✅ Use service role for admin operations
- ✅ Test policies with different user roles
- ✅ Keep policies simple and readable
- ✅ Document policy intent
- ✅ Use RLS policies as defense-in-depth (not sole security measure)

---

## Validation After RLS Changes

When modifying RLS policies:

1. **Added Policy**:
   - Update this file with policy details
   - Test with affected user roles
   - Verify no unintended access granted

2. **Modified Policy**:
   - Document change in this file
   - Test before and after behavior
   - Check for performance impact

3. **Removed Policy**:
   - Ensure access still controlled
   - Update documentation
   - Consider audit log implications

See `docs/VALIDATION-CHECKLIST.md` for complete validation workflow.
