# Database Schema Documentation

## Overview

This directory contains comprehensive documentation for all 28 database tables in the Welp Customer Insights platform. All tables have Row Level Security (RLS) enabled.

## PostgreSQL Version
- **Current**: 15.8.1.147 (needs upgrade to 15.10+)

## Documentation Structure

Database tables are organized by domain for efficient context management. Load only the schema files relevant to your current task.

### Core Schema (`schema-core.md`)
The foundation of the review platform:
- `profiles` - User accounts (business owners and customers)
- `business_info` - Business details and verification
- `reviews` - Customer reviews
- `responses` - Business responses to reviews
- `review_photos` - Photos attached to reviews

### Authentication Schema (`schema-auth.md`)
Email and phone verification systems:
- `verification_codes` - Phone verification codes
- `email_verification_codes` - Email verification codes
- `auth_rate_limits` - Rate limiting for auth operations
- `account_lockout` - Account lockout tracking
- `user_sessions` - Active user sessions

### Billing Schema (`schema-billing.md`)
Credits and subscription system:
- `credits` - User credit balances
- `credit_transactions` - Credit purchase/usage history
- `subscriptions` - Stripe subscription management
- `subscribers` - Subscription relationships

### Notifications Schema (`schema-notifications.md`)
Email notification system (via Resend):
- `notification_preferences` - User notification settings
- `notifications_log` - Notification history
- `device_tokens` - Reserved for future use
- `user_review_notifications` - Review-specific notifications

### Reviews Schema (`schema-reviews.md`)
Review management and moderation:
- `review_claims` - Business claims on reviews
- `review_claim_history` - Claim audit trail
- `review_reports` - Reported reviews
- `customer_review_associations` - Customer-review links

### Conversations Schema (`schema-conversations.md`)
Review conversation system:
- `review_conversations` - Conversation threads
- `conversation_participants` - Participant tracking

### Access Schema (`schema-access.md`)
Access control and security:
- `customer_access` - Customer access tokens
- `guest_access` - Time-limited guest access
- `verification_requests` - Business verification requests
- `security_audit_log` - Security event logging

### Constraints Documentation
- `constraints.md` - All foreign keys, unique constraints, check constraints

### RLS Policies Documentation
- `rls-policies.md` - Row Level Security policies for all 28 tables

## Quick Reference

See `QUICK_REFERENCE.md` for fast table lookups by use case.

## Reading Order for AI Agents

When working on a task:

1. **Start here** - Understand the documentation structure
2. **Read QUICK_REFERENCE.md** - Find relevant tables for your task
3. **Read specific schema files** - Load only the domain(s) you need
4. **Read constraints.md** - Understand relationships between tables
5. **Read rls-policies.md** - Understand access control

## Navigation

| Domain | File | Tables | Primary Use Cases |
|--------|------|--------|-------------------|
| Core | [schema-core.md](schema-core.md) | 5 tables | Reviews, profiles, business info |
| Auth | [schema-auth.md](schema-auth.md) | 5 tables | Verification, sessions, security |
| Billing | [schema-billing.md](schema-billing.md) | 4 tables | Credits, subscriptions |
| Notifications | [schema-notifications.md](schema-notifications.md) | 4 tables | Email notifications |
| Reviews | [schema-reviews.md](schema-reviews.md) | 4 tables | Review claims, reports |
| Conversations | [schema-conversations.md](schema-conversations.md) | 2 tables | Review conversations |
| Access | [schema-access.md](schema-access.md) | 4 tables | Guest access, verification |

## Important Notes

- **All tables have RLS enabled** - Access control is enforced at database level
- **All timestamps are UTC** - See `docs/temp/03-utc-date-handling.md` for date handling standards
- **Foreign keys are documented** - See `constraints.md` for complete relationship map
- **No legacy references** - Documentation reflects current state only
- **Real code pointers included** - File paths show where tables are used

## Database Access Patterns

**Frontend Access:**
- Via Supabase client (`src/integrations/supabase/client.ts`)
- Services layer (e.g., `src/services/reviewSubmissionService.ts`)
- Hooks (e.g., `src/hooks/useReviewSubmission.ts`)

**Backend Access:**
- Edge Functions (`supabase/functions/*/index.ts`)
- Direct Postgres via Supabase client

## Security Advisories

**Current Issues:**
- OTP expiry time too long (should be reduced)
- Leaked password protection disabled (should be enabled)
- PostgreSQL needs upgrade to 15.10+

See Supabase Dashboard → Project Settings → Security for configuration.

## Validation

After any database schema changes:
1. Run `mcp__supabase__list_tables` to verify current state
2. Update relevant schema-*.md files
3. Update constraints.md if foreign keys changed
4. Update rls-policies.md if RLS policies changed
5. Update QUICK_REFERENCE.md if user-visible tables affected
6. Run through `docs/VALIDATION-CHECKLIST.md`

## Related Documentation

- **Edge Functions**: See `docs/edge-functions/` for functions that query these tables
- **Architecture**: See `docs/architecture/` for feature flows and data patterns
- **Quick Reference**: See `docs/QUICK-REFERENCE.md` for feature-to-table mapping
