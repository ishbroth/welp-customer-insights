# Database Constraints

Complete reference of all foreign keys, unique constraints, and check constraints across all 28 tables.

## Foreign Keys

Foreign keys define relationships between tables. Format: `source_table.column → target_table(column)`

### From profiles

| Source Column | Target | On Delete | Purpose |
|---------------|--------|-----------|---------|
| `profiles.id` | `auth.users(id)` | CASCADE | Link to Supabase Auth |

### From business_info

| Source Column | Target | On Delete | Purpose |
|---------------|--------|-----------|---------|
| `business_info.user_id` | `profiles(id)` | CASCADE | Business owner |

### From reviews

| Source Column | Target | On Delete | Purpose |
|---------------|--------|-----------|---------|
| `reviews.business_id` | `business_info(id)` | CASCADE | Business being reviewed |
| `reviews.customer_id` | `profiles(id)` | SET NULL | Customer who wrote review (nullable for anonymous) |

### From responses

| Source Column | Target | On Delete | Purpose |
|---------------|--------|-----------|---------|
| `responses.review_id` | `reviews(id)` | CASCADE | Review being responded to |
| `responses.user_id` | `profiles(id)` | CASCADE | Business owner responding |

### From review_photos

| Source Column | Target | On Delete | Purpose |
|---------------|--------|-----------|---------|
| `review_photos.review_id` | `reviews(id)` | CASCADE | Review photos belong to |

### From verification_codes

No foreign keys (standalone verification table)

### From email_verification_codes

| Source Column | Target | On Delete | Purpose |
|---------------|--------|-----------|---------|
| `email_verification_codes.user_id` | `profiles(id)` | CASCADE | User being verified (nullable) |

### From auth_rate_limits

No foreign keys (tracks by identifier string, not user_id)

### From account_lockout

| Source Column | Target | On Delete | Purpose |
|---------------|--------|-----------|---------|
| `account_lockout.user_id` | `profiles(id)` | CASCADE | User whose account is locked |

### From user_sessions

| Source Column | Target | On Delete | Purpose |
|---------------|--------|-----------|---------|
| `user_sessions.user_id` | `profiles(id)` | CASCADE | User who owns session |

### From credits

| Source Column | Target | On Delete | Purpose |
|---------------|--------|-----------|---------|
| `credits.user_id` | `profiles(id)` | CASCADE | User who owns credits |

### From credit_transactions

| Source Column | Target | On Delete | Purpose |
|---------------|--------|-----------|---------|
| `credit_transactions.user_id` | `profiles(id)` | CASCADE | User this transaction belongs to |

### From subscriptions

No foreign keys (Stripe is source of truth, linked via subscribers table)

### From subscribers

| Source Column | Target | On Delete | Purpose |
|---------------|--------|-----------|---------|
| `subscribers.user_id` | `profiles(id)` | CASCADE | User who owns subscription |
| `subscribers.subscription_id` | `subscriptions(id)` | CASCADE | Subscription record |

### From notification_preferences

| Source Column | Target | On Delete | Purpose |
|---------------|--------|-----------|---------|
| `notification_preferences.user_id` | `profiles(id)` | CASCADE | User these preferences belong to |

### From notifications_log

| Source Column | Target | On Delete | Purpose |
|---------------|--------|-----------|---------|
| `notifications_log.user_id` | `profiles(id)` | CASCADE | Recipient user |

### From device_tokens

| Source Column | Target | On Delete | Purpose |
|---------------|--------|-----------|---------|
| `device_tokens.user_id` | `profiles(id)` | CASCADE | User this token belongs to |

### From user_review_notifications

| Source Column | Target | On Delete | Purpose |
|---------------|--------|-----------|---------|
| `user_review_notifications.user_id` | `profiles(id)` | CASCADE | User who was notified |
| `user_review_notifications.review_id` | `reviews(id)` | CASCADE | Review that triggered notification |

### From review_claims

| Source Column | Target | On Delete | Purpose |
|---------------|--------|-----------|---------|
| `review_claims.review_id` | `reviews(id)` | CASCADE | Review being claimed |
| `review_claims.business_id` | `business_info(id)` | CASCADE | Business making claim |

### From review_claim_history

| Source Column | Target | On Delete | Purpose |
|---------------|--------|-----------|---------|
| `review_claim_history.claim_id` | `review_claims(id)` | CASCADE | Claim this history entry belongs to |
| `review_claim_history.changed_by` | `profiles(id)` | SET NULL | User who made change (nullable) |

### From review_reports

| Source Column | Target | On Delete | Purpose |
|---------------|--------|-----------|---------|
| `review_reports.review_id` | `reviews(id)` | CASCADE | Review being reported |
| `review_reports.reported_by` | `profiles(id)` | CASCADE | User who reported |

### From customer_review_associations

| Source Column | Target | On Delete | Purpose |
|---------------|--------|-----------|---------|
| `customer_review_associations.customer_id` | `profiles(id)` | CASCADE | Customer who wrote review |
| `customer_review_associations.review_id` | `reviews(id)` | CASCADE | Review that was written |

### From review_conversations

| Source Column | Target | On Delete | Purpose |
|---------------|--------|-----------|---------|
| `review_conversations.review_id` | `reviews(id)` | CASCADE | Review this conversation is about |
| `review_conversations.sender_id` | `profiles(id)` | CASCADE | User who sent message |

### From conversation_participants

| Source Column | Target | On Delete | Purpose |
|---------------|--------|-----------|---------|
| `conversation_participants.review_id` | `reviews(id)` | CASCADE | Review conversation is about |
| `conversation_participants.user_id` | `profiles(id)` | CASCADE | Participant user |

### From customer_access

| Source Column | Target | On Delete | Purpose |
|---------------|--------|-----------|---------|
| `customer_access.business_id` | `business_info(id)` | CASCADE | Business granting access |
| `customer_access.customer_id` | `profiles(id)` | CASCADE | Customer receiving access |

### From guest_access

| Source Column | Target | On Delete | Purpose |
|---------------|--------|-----------|---------|
| `guest_access.review_id` | `reviews(id)` | CASCADE | Review accessible via token |

### From verification_requests

| Source Column | Target | On Delete | Purpose |
|---------------|--------|-----------|---------|
| `verification_requests.user_id` | `profiles(id)` | CASCADE | Business owner requesting verification |
| `verification_requests.reviewed_by` | `profiles(id)` | SET NULL | Admin who reviewed (nullable) |

### From security_audit_log

| Source Column | Target | On Delete | Purpose |
|---------------|--------|-----------|---------|
| `security_audit_log.user_id` | `profiles(id)` | SET NULL | User involved (nullable) |

---

## Unique Constraints

Unique constraints ensure no duplicate values.

### profiles
- `id` (Primary Key)
- `email` (Case-insensitive unique)
- `phone_number` (Unique)

### business_info
- `id` (Primary Key)
- `user_id` (One business per user)
- `license_number` (If provided, must be unique)

### reviews
- `id` (Primary Key)

### responses
- `id` (Primary Key)
- `review_id` (One response per review)

### review_photos
- `id` (Primary Key)

### verification_codes
- `id` (Primary Key)

### email_verification_codes
- `id` (Primary Key)

### auth_rate_limits
- `id` (Primary Key)
- `(identifier, action)` (One rate limit per identifier+action combination)

### account_lockout
- `id` (Primary Key)
- `user_id` (One lockout per user at a time)

### user_sessions
- `id` (Primary Key)
- `session_token` (Unique session identifier)

### credits
- `id` (Primary Key)
- `user_id` (One credit record per user)

### credit_transactions
- `id` (Primary Key)

### subscriptions
- `id` (Primary Key)
- `stripe_subscription_id` (Unique Stripe ID)

### subscribers
- `id` (Primary Key)
- `(user_id, subscription_id)` (Prevent duplicate subscriptions)

### notification_preferences
- `id` (Primary Key)
- `user_id` (One preference record per user)

### notifications_log
- `id` (Primary Key)

### device_tokens
- `id` (Primary Key)
- `token` (Unique device token)

### user_review_notifications
- `id` (Primary Key)
- `(user_id, review_id, notification_type)` (Prevent duplicate notifications)

### review_claims
- `id` (Primary Key)

### review_claim_history
- `id` (Primary Key)

### review_reports
- `id` (Primary Key)

### customer_review_associations
- `id` (Primary Key)
- `(customer_id, review_id)` (One association per customer-review pair)

### review_conversations
- `id` (Primary Key)

### conversation_participants
- `id` (Primary Key)
- `(review_id, user_id)` (One participation per user-review pair)

### customer_access
- `id` (Primary Key)
- `(business_id, customer_id)` (One access grant per business-customer pair)

### guest_access
- `id` (Primary Key)
- `access_token` (Unique access token)

### verification_requests
- `id` (Primary Key)

### security_audit_log
- `id` (Primary Key)

---

## Check Constraints

Check constraints enforce data validation rules.

### profiles
- `role IN ('customer', 'business')`

### reviews
- `rating >= 1 AND rating <= 5`
- `anonymous = false OR customer_id IS NULL` (Anonymous reviews can't have customer_id)

### verification_codes
- `LENGTH(code) = 6` (6-digit OTP)
- `attempts >= 0`

### email_verification_codes
- `LENGTH(code) = 6` (6-digit OTP)

### auth_rate_limits
- `attempt_count > 0`

### credits
- `balance >= 0` (Cannot go negative)

### credit_transactions
- `amount != 0` (Must be positive or negative, not zero)
- `transaction_type IN ('purchase', 'usage', 'refund', 'admin_adjustment')`

### subscriptions
- `status IN ('active', 'canceled', 'past_due', 'unpaid', 'incomplete', 'incomplete_expired', 'trialing')`

### notifications_log
- `channel IN ('email', 'push', 'sms')`
- `notification_type IN ('review_created', 'response_created', 'conversation_message', 'verification_approved', 'subscription_status', 'credit_purchase')`

### device_tokens
- `platform IN ('ios', 'android', 'web')`

### user_review_notifications
- `notification_type IN ('review_created', 'response_created')`

### review_claims
- `status IN ('pending', 'approved', 'rejected')`

### review_claim_history
- `old_status IN ('pending', 'approved', 'rejected')` (Nullable)
- `new_status IN ('pending', 'approved', 'rejected')`

### review_reports
- `status IN ('pending', 'resolved', 'dismissed')`
- `reason IN ('spam', 'offensive', 'inappropriate', 'fake', 'other')`

### guest_access
- `accessed_count >= 0`

### verification_requests
- `status IN ('pending', 'approved', 'rejected')`

### security_audit_log
- `event_type IN ('login', 'logout', 'failed_login', 'password_change', 'email_change', 'account_created', 'account_deleted', 'suspicious_activity', 'rate_limit_exceeded', 'access_denied')`
- `severity IN ('info', 'warning', 'critical')`

---

## Cascade Behavior Summary

**ON DELETE CASCADE** (child deleted when parent deleted):
- All `profiles` relationships cascade (deleting user deletes all their data)
- All `business_info` relationships cascade
- All `reviews` relationships cascade
- Most table relationships follow cascade pattern for data integrity

**ON DELETE SET NULL** (child remains, FK set to null):
- `reviews.customer_id` → `profiles(id)` (review persists if customer deleted)
- `email_verification_codes.user_id` → `profiles(id)` (code persists for audit)
- `review_claim_history.changed_by` → `profiles(id)` (history persists, admin reference cleared)
- `verification_requests.reviewed_by` → `profiles(id)` (request persists, admin reference cleared)
- `security_audit_log.user_id` → `profiles(id)` (log persists for security audit)

---

## Indexes

All foreign keys have indexes for performance. Additional notable indexes:

### Performance-Critical Indexes
- `reviews.business_id` - Lookup reviews for business
- `reviews.customer_id` - Lookup reviews by customer
- `reviews.created_at` - Chronological ordering
- `notifications_log.sent_at` - Chronological ordering
- `credit_transactions.created_at` - Transaction history
- `subscriptions.current_period_end` - Find expiring subscriptions
- `guest_access.access_token` - Fast token validation
- `user_sessions.session_token` - Fast session lookup

See individual schema files for complete index details.

---

## Relationship Map

**Central Tables**:
- `profiles` - Referenced by almost everything
- `reviews` - Hub for review system
- `business_info` - Business data and relationships

**1-to-1 Relationships**:
- `profiles` ↔ `business_info` (one business per user)
- `profiles` ↔ `credits` (one credit balance per user)
- `profiles` ↔ `notification_preferences` (one preference set per user)
- `reviews` ↔ `responses` (one response per review)

**1-to-Many Relationships**:
- `profiles` → many `reviews`
- `business_info` → many `reviews`
- `reviews` → many `review_photos`
- `reviews` → many `review_conversations`
- `profiles` → many `credit_transactions`
- `subscriptions` → many `subscribers`

**Many-to-Many Relationships** (via junction tables):
- `profiles` ↔ `reviews` via `customer_review_associations` (anonymous review tracking)
- `profiles` ↔ `reviews` via `conversation_participants` (conversation access)

---

## Validation After Schema Changes

When modifying database schema:

1. **Added Foreign Key**:
   - Update this file with new relationship
   - Update relevant schema-*.md file
   - Update QUICK_REFERENCE.md if user-facing

2. **Added Unique Constraint**:
   - Document in this file's unique constraints section
   - Update schema-*.md file with constraint info

3. **Added Check Constraint**:
   - Document in this file's check constraints section
   - Update schema-*.md file with validation rules

4. **Changed Cascade Behavior**:
   - Update this file's foreign keys section
   - Consider data migration implications
   - Test deletion scenarios

See `docs/VALIDATION-CHECKLIST.md` for complete validation workflow.
