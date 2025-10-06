# Database Quick Reference

Fast lookup guide for finding the right tables for common tasks.

## By Feature

### User Authentication & Profiles
- `profiles` - User accounts (id, email, role, name)
- `verification_codes` - Phone verification OTPs
- `email_verification_codes` - Email verification OTPs
- `auth_rate_limits` - Prevent brute force attacks
- `account_lockout` - Track locked accounts
- `user_sessions` - Active login sessions

### Business Information
- `business_info` - Business details (name, address, license)
- `verification_requests` - Business verification requests
- `profiles` - Business owner profile (linked via user_id)

### Reviews System
- `reviews` - Customer reviews (rating, content, created_at)
- `review_photos` - Photos attached to reviews
- `customer_review_associations` - Link customers to reviews
- `responses` - Business responses to reviews
- `review_reports` - Reported/flagged reviews
- `review_claims` - Business claims on reviews
- `review_claim_history` - Audit trail for claims

### Conversations
- `review_conversations` - Message threads on reviews
- `conversation_participants` - Who's in each conversation
- `reviews` - Parent review for conversation
- `profiles` - Message authors

### Billing & Credits
- `credits` - User credit balances
- `credit_transactions` - Purchase/usage history
- `subscriptions` - Stripe subscription data
- `subscribers` - User subscription relationships

### Notifications
- `notification_preferences` - User settings (email on/off)
- `notifications_log` - All sent notifications
- `user_review_notifications` - Review-specific notification tracking
- `device_tokens` - Reserved for future use

### Access Control
- `customer_access` - Customer access tokens for businesses
- `guest_access` - Time-limited guest access tokens
- `verification_requests` - Business verification workflow
- `security_audit_log` - Security events and audit trail

## By Common Task

### "User signs up"
1. Insert into `profiles` (creates auth.users entry automatically)
2. Send verification code via `verification_codes` or `email_verification_codes`
3. Log in `auth_rate_limits` to prevent abuse

### "Customer writes a review"
1. Insert into `reviews` (customer_id, business_id, rating, content)
2. Insert photos into `review_photos` if provided
3. Create entry in `customer_review_associations`
4. Check `notification_preferences` for business owner
5. Insert into `notifications_log` when email sent

### "Business responds to review"
1. Check credits in `credits` table or subscription in `subscriptions`
2. Insert into `responses` (review_id, response_content)
3. Deduct credit via `credit_transactions` if needed
4. Check customer's `notification_preferences`
5. Insert into `notifications_log` when email sent

### "Business purchases credits"
1. Process payment via Stripe (Edge Function)
2. Insert into `credit_transactions` (purchase record)
3. Update `credits` balance

### "Start a conversation on a review"
1. Insert into `review_conversations` (review_id, initial message)
2. Insert into `conversation_participants` (both parties)
3. Check `notification_preferences` for recipient
4. Insert into `notifications_log` when email sent

### "Grant guest access to a review"
1. Insert into `guest_access` (token, review_id, expires_at)
2. Return shareable link with token

### "Business claims a review"
1. Insert into `review_claims` (review_id, business_id, status)
2. Insert into `review_claim_history` (audit entry)
3. Update `reviews` if claim approved

## By Role

### Customer Can Access
- Their own `profiles` record
- Their own `reviews`
- Their own `review_photos`
- `review_conversations` they're a participant in
- `responses` to their reviews
- `business_info` (read-only, all businesses)
- Their own `customer_access` grants

### Business Owner Can Access
- Their own `profiles` record
- Their own `business_info` record
- `reviews` for their business
- `responses` they've created
- `review_conversations` for their reviews
- Their own `credits` and `credit_transactions`
- Their own `subscriptions` and `subscribers`
- Their own `verification_requests`
- `customer_access` for their business

### Guest Can Access
- Single review via `guest_access` token
- Related `responses` for that review
- Related `business_info` for that review

## Foreign Key Cheat Sheet

**profiles.id referenced by:**
- business_info.user_id
- reviews.customer_id
- responses.user_id
- review_conversations (messages author)
- conversation_participants.user_id
- credits.user_id
- subscribers.user_id
- customer_access.customer_id
- verification_requests.user_id

**business_info.id referenced by:**
- reviews.business_id
- customer_access.business_id

**reviews.id referenced by:**
- review_photos.review_id
- responses.review_id
- review_conversations.review_id
- review_claims.review_id
- review_reports.review_id
- customer_review_associations.review_id
- guest_access.review_id

## Indexes & Performance

**Key indexes for common queries:**
- `reviews.business_id` - Lookup reviews for a business
- `reviews.customer_id` - Lookup reviews by customer
- `review_conversations.review_id` - Lookup conversations for review
- `notification_preferences.user_id` - Check user's notification settings
- `credits.user_id` - Check user's credit balance

See individual schema files for complete index information.

## Timestamps

All tables use UTC timestamps:
- `created_at` - When record was created
- `updated_at` - Last modification (auto-updated via trigger)
- `expires_at` - For time-limited resources (guest access, OTPs)

See `docs/temp/03-utc-date-handling.md` for date handling standards.

## RLS (Row Level Security)

All 28 tables have RLS enabled. Key policies:
- Users can read their own data
- Businesses can read reviews about them
- Customers can read their own reviews
- Public data (business_info) readable by all authenticated users

See `rls-policies.md` for complete policy details.

## Need More Detail?

Load the specific schema file for your domain:
- Core tables → `schema-core.md`
- Auth tables → `schema-auth.md`
- Billing tables → `schema-billing.md`
- Notification tables → `schema-notifications.md`
- Review tables → `schema-reviews.md`
- Conversation tables → `schema-conversations.md`
- Access tables → `schema-access.md`
