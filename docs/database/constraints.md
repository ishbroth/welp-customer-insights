# Database Constraints

Complete reference of all foreign keys, unique constraints, and check constraints across all 28 tables in the database.

## Foreign Keys

Foreign keys define relationships between tables. Format: `source_table.column → target_table(column)`

### Auth Schema Foreign Keys

#### auth.identities
| Source Column | Target | Purpose |
|---------------|--------|---------|
| `user_id` | `auth.users(id)` | Link identity to auth user |

#### auth.mfa_amr_claims
| Source Column | Target | Purpose |
|---------------|--------|---------|
| `session_id` | `auth.sessions(id)` | Link MFA claim to session |

#### auth.mfa_challenges
| Source Column | Target | Purpose |
|---------------|--------|---------|
| `factor_id` | `auth.mfa_factors(id)` | Link challenge to MFA factor |

#### auth.mfa_factors
| Source Column | Target | Purpose |
|---------------|--------|---------|
| `user_id` | `auth.users(id)` | Link MFA factor to user |

#### auth.one_time_tokens
| Source Column | Target | Purpose |
|---------------|--------|---------|
| `user_id` | `auth.users(id)` | Link token to user |

#### auth.refresh_tokens
| Source Column | Target | Purpose |
|---------------|--------|---------|
| `session_id` | `auth.sessions(id)` | Link refresh token to session |

#### auth.saml_providers
| Source Column | Target | Purpose |
|---------------|--------|---------|
| `sso_provider_id` | `auth.sso_providers(id)` | Link SAML provider to SSO provider |

#### auth.saml_relay_states
| Source Column | Target | Purpose |
|---------------|--------|---------|
| `flow_state_id` | `auth.flow_state(id)` | Link relay state to flow state |
| `sso_provider_id` | `auth.sso_providers(id)` | Link relay state to SSO provider |

#### auth.sessions
| Source Column | Target | Purpose |
|---------------|--------|---------|
| `user_id` | `auth.users(id)` | Link session to user |

#### auth.sso_domains
| Source Column | Target | Purpose |
|---------------|--------|---------|
| `sso_provider_id` | `auth.sso_providers(id)` | Link domain to SSO provider |

### Public Schema Foreign Keys

#### profiles
**NO FOREIGN KEYS** - `id` is a primary key only, NOT a foreign key to auth.users

#### business_info
| Source Column | Target | Purpose |
|---------------|--------|---------|
| `id` | `profiles(id)` | One-to-one link to profile |

#### reviews
| Source Column | Target | Purpose |
|---------------|--------|---------|
| `business_id` | `profiles(id)` | Business being reviewed |

#### responses
| Source Column | Target | Purpose |
|---------------|--------|---------|
| `review_id` | `reviews(id)` | Review being responded to |
| `author_id` | `auth.users(id)` | User who wrote response |

#### review_photos
| Source Column | Target | Purpose |
|---------------|--------|---------|
| `review_id` | `reviews(id)` | Review photos belong to |

#### subscriptions
| Source Column | Target | Purpose |
|---------------|--------|---------|
| `user_id` | `profiles(id)` | User with subscription |

#### customer_access
| Source Column | Target | Purpose |
|---------------|--------|---------|
| `business_id` | `profiles(id)` | Business granting access |
| `customer_id` | `profiles(id)` | Customer receiving access |

#### verification_codes
**NO FOREIGN KEYS** - Standalone verification table

#### notification_preferences
| Source Column | Target | Purpose |
|---------------|--------|---------|
| `user_id` | `auth.users(id)` | User's notification preferences |

#### notifications_log
| Source Column | Target | Purpose |
|---------------|--------|---------|
| `user_id` | `auth.users(id)` | Recipient user |

#### credits
| Source Column | Target | Purpose |
|---------------|--------|---------|
| `user_id` | `auth.users(id)` | User who owns credits |

#### credit_transactions
| Source Column | Target | Purpose |
|---------------|--------|---------|
| `user_id` | `auth.users(id)` | User this transaction belongs to |

#### verification_requests
**NO FOREIGN KEYS** - Standalone request tracking

#### user_sessions
| Source Column | Target | Purpose |
|---------------|--------|---------|
| `user_id` | `auth.users(id)` | User who owns session |

#### user_review_notifications
| Source Column | Target | Purpose |
|---------------|--------|---------|
| `user_id` | `auth.users(id)` | User who was notified |
| `review_id` | `reviews(id)` | Review that triggered notification |

#### review_claim_history
**NO FOREIGN KEYS** - Standalone history tracking

#### review_reports
| Source Column | Target | Purpose |
|---------------|--------|---------|
| `review_id` | `reviews(id)` | Review being reported |

#### device_tokens
**NO FOREIGN KEYS** - No foreign key constraint

#### guest_access
| Source Column | Target | Purpose |
|---------------|--------|---------|
| `review_id` | `reviews(id)` | Review accessible via token |

#### email_verification_codes
**NO FOREIGN KEYS** - Standalone email verification

#### auth_rate_limits
**NO FOREIGN KEYS** - Tracks by identifier string, not user_id

#### account_lockout
**NO FOREIGN KEYS** - Tracks by identifier string, not user_id

#### security_audit_log
**NO FOREIGN KEYS** - Audit log with nullable user_id

#### customer_review_associations
**NO FOREIGN KEYS** - Association tracking

#### review_claims
| Source Column | Target | Purpose |
|---------------|--------|---------|
| `review_id` | `reviews(id)` | Review being claimed |
| `claimed_by` | `auth.users(id)` | User claiming review |
| `credit_transaction_id` | `credit_transactions(id)` | Associated credit transaction |

#### review_conversations
| Source Column | Target | Purpose |
|---------------|--------|---------|
| `review_id` | `reviews(id)` | Review this conversation is about |

#### conversation_participants
| Source Column | Target | Purpose |
|---------------|--------|---------|
| `review_id` | `reviews(id)` | Review conversation is about |

#### subscribers
| Source Column | Target | Purpose |
|---------------|--------|---------|
| `user_id` | `auth.users(id)` | User who subscribed |

---

## Unique Constraints

Unique constraints ensure no duplicate values.

### Auth Schema

#### auth.users
- `phone` - Unique phone number

#### auth.refresh_tokens
- `token` - Unique refresh token

#### auth.saml_providers
- `entity_id` - Unique SAML entity ID

#### auth.oauth_clients
- `client_id` - Unique OAuth client ID

### Public Schema

#### profiles
- `id` (Primary Key only)

#### business_info
- `id` (Primary Key only)

#### reviews
- `id` (Primary Key only)

#### responses
- `id` (Primary Key only)

#### review_photos
- `id` (Primary Key only)

#### verification_codes
- `id` (Primary Key only)
- `phone` - Unique phone number per verification

#### email_verification_codes
- `id` (Primary Key only)
- `email` - Unique email per verification

#### auth_rate_limits
- `id` (Primary Key only)

#### account_lockout
- `id` (Primary Key only)
- `(identifier, lockout_type)` - Unique composite constraint (one lockout per identifier/type)

#### user_sessions
- `id` (Primary Key only)

#### credits
- `id` (Primary Key only)
- `user_id` - One credit record per user

#### credit_transactions
- `id` (Primary Key only)

#### subscriptions
- `id` (Primary Key only)

#### subscribers
- `id` (Primary Key only)
- `email` - Unique email

#### notification_preferences
- `id` (Primary Key only)
- `user_id` - One preference record per user

#### notifications_log
- `id` (Primary Key only)

#### device_tokens
- `id` (Primary Key only)

#### user_review_notifications
- `id` (Primary Key only)

#### review_claims
- `id` (Primary Key only)
- `review_id` - One claim per review

#### review_claim_history
- `id` (Primary Key only)

#### review_reports
- `id` (Primary Key only)

#### customer_review_associations
- `id` (Primary Key only)

#### review_conversations
- `id` (Primary Key only)

#### conversation_participants
- `id` (Primary Key only)
- `review_id` - One participant record per review

#### customer_access
- `id` (Primary Key only)

#### guest_access
- `id` (Primary Key only)
- `access_token` - Unique access token

#### verification_requests
- `id` (Primary Key only)

#### security_audit_log
- `id` (Primary Key only)

---

## Check Constraints

Check constraints enforce data validation rules.

### Auth Schema

#### auth.one_time_tokens
- `char_length(token_hash) > 0` - Token hash must not be empty

#### auth.users
- `email_change_confirm_status >= 0 AND email_change_confirm_status <= 2` - Valid email change status

#### auth.saml_providers
- `char_length(entity_id) > 0` - Entity ID must not be empty
- `char_length(metadata_xml) > 0` - Metadata XML must not be empty
- `metadata_url = NULL::text OR char_length(metadata_url) > 0` - Metadata URL must be null or non-empty

#### auth.saml_relay_states
- `char_length(request_id) > 0` - Request ID must not be empty

#### auth.sso_providers
- `resource_id = NULL::text OR char_length(resource_id) > 0` - Resource ID must be null or non-empty

#### auth.oauth_clients
- `char_length(client_name) <= 1024` - Client name max length
- `char_length(client_uri) <= 2048` - Client URI max length
- `char_length(logo_uri) <= 2048` - Logo URI max length

### Public Schema

#### credit_transactions
- `type = ANY (ARRAY['purchase'::text, 'usage'::text, 'refund'::text])` - Valid transaction types

#### customer_review_associations
- `association_type = ANY (ARRAY['purchased'::text, 'responded'::text])` - Valid association types

#### review_claims
- `claim_type = ANY (ARRAY['credit_unlock'::text, 'subscription_response'::text, 'direct_claim'::text, 'conversation_response'::text])` - Valid claim types

#### review_conversations
- `author_type = ANY (ARRAY['business'::text, 'customer'::text])` - Valid author types

---

## Notable Absence of Constraints

These constraints were documented but DO NOT EXIST in the actual database:

### Non-existent Foreign Keys
- ❌ profiles.id → auth.users(id) - profiles.id is just a UUID primary key
- ❌ business_info.user_id → profiles(id) - actual FK is business_info.id → profiles(id)
- ❌ reviews.customer_id - this column doesn't exist
- ❌ responses.user_id → profiles(id) - actual FK is responses.author_id → auth.users(id)
- ❌ email_verification_codes.user_id - this column doesn't exist
- ❌ account_lockout.user_id - this table exists but has no foreign keys
- ❌ device_tokens.user_id - this table has no foreign keys
- ❌ review_reports.reported_by - this column doesn't exist
- ❌ subscribers.subscription_id - this column doesn't exist
- ❌ verification_requests.reviewed_by - this column doesn't exist
- ❌ review_claim_history.claim_id - this column doesn't exist
- ❌ review_claim_history.changed_by - this column doesn't exist
- ❌ review_conversations.sender_id - this column doesn't exist
- ❌ conversation_participants.user_id - this column doesn't exist
- ❌ customer_access non-existent columns
- ❌ security_audit_log.user_id - nullable column with no foreign key

### Non-existent Unique Constraints
- ❌ profiles.email - no unique constraint exists
- ❌ profiles.phone_number - column doesn't exist (it's just 'phone' with no unique constraint)
- ❌ business_info.user_id - column doesn't exist
- ❌ business_info.license_number - no unique constraint
- ❌ responses.review_id - no unique constraint (one-to-many allowed)
- ❌ auth_rate_limits (identifier, action) - no composite unique
- ❌ account_lockout.user_id - no unique constraint
- ❌ user_sessions.session_token - column doesn't exist
- ❌ subscriptions.stripe_subscription_id - column doesn't exist
- ❌ subscribers (user_id, subscription_id) - subscription_id column doesn't exist
- ❌ device_tokens.token - no unique constraint
- ❌ user_review_notifications (user_id, review_id, notification_type) - no composite unique, notification_type doesn't exist
- ❌ customer_review_associations (customer_id, review_id) - no composite unique
- ❌ conversation_participants (review_id, user_id) - user_id doesn't exist
- ❌ customer_access (business_id, customer_id) - no composite unique

### Non-existent Check Constraints
- ❌ profiles.role - no check constraint
- ❌ reviews.rating >= 1 AND rating <= 5 - no check constraint
- ❌ reviews.anonymous = false OR customer_id IS NULL - no check constraint
- ❌ verification_codes.LENGTH(code) = 6 - no check constraint
- ❌ verification_codes.attempts >= 0 - no check constraint
- ❌ email_verification_codes.LENGTH(code) = 6 - no check constraint
- ❌ auth_rate_limits.attempt_count > 0 - no check constraint
- ❌ credits.balance >= 0 - no check constraint
- ❌ credit_transactions.amount != 0 - no check constraint
- ❌ credit_transactions includes 'admin_adjustment' - actual constraint only has purchase/usage/refund
- ❌ subscriptions.status check - no check constraint
- ❌ notifications_log.channel - no check constraint
- ❌ notifications_log.notification_type - no check constraint
- ❌ device_tokens.platform - no check constraint
- ❌ user_review_notifications.notification_type - no check constraint
- ❌ review_claims.status - no check constraint
- ❌ review_claim_history.old_status - no check constraint
- ❌ review_claim_history.new_status - no check constraint
- ❌ review_reports.status - no check constraint
- ❌ review_reports.reason - no check constraint
- ❌ guest_access.accessed_count >= 0 - no check constraint
- ❌ verification_requests.status - no check constraint
- ❌ security_audit_log.event_type - no check constraint
- ❌ security_audit_log.severity - no check constraint

---

## Relationship Map

**Central Tables**:
- `auth.users` - Referenced by many public schema tables
- `profiles` - Referenced by business_info, reviews, subscriptions, customer_access
- `reviews` - Hub for review system

**1-to-1 Relationships**:
- `profiles` ↔ `business_info` (one business per profile via id)
- `auth.users` ↔ `credits` (one credit balance per user via user_id unique)
- `auth.users` ↔ `notification_preferences` (one preference set per user via user_id unique)
- `reviews` ↔ `review_claims` (one claim per review via review_id unique)
- `reviews` ↔ `conversation_participants` (one participant per review via review_id unique)

**1-to-Many Relationships**:
- `auth.users` → many `auth.sessions`
- `auth.users` → many `responses` (via author_id)
- `auth.users` → many `notifications_log`
- `auth.users` → many `credit_transactions`
- `auth.users` → many `user_sessions`
- `auth.users` → many `subscribers`
- `profiles` → many `reviews` (via business_id)
- `profiles` → many `subscriptions`
- `reviews` → many `review_photos`
- `reviews` → many `review_conversations`
- `reviews` → many `review_reports`
- `reviews` → many `guest_access`

**Many-to-Many Relationships**:
- None via junction tables currently

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
