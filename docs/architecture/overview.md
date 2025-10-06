# Welp Platform - System Architecture Overview

## Tech Stack

### Frontend
- **Framework**: React 18.3.1 with TypeScript
- **Routing**: React Router DOM v6
- **Build Tool**: Vite 5.4.1
- **State Management**: React Query (TanStack Query) for server state
- **UI Components**: Radix UI + shadcn/ui component library
- **Styling**: Tailwind CSS with custom theme
- **Forms**: React Hook Form with Zod validation
- **Mobile**: Capacitor 7.4.0 (iOS & Android support)

### Backend
- **Database**: PostgreSQL via Supabase
- **Auth**: Supabase Auth with custom email/phone verification
- **Storage**: Supabase Storage for photos/avatars
- **Edge Functions**: Deno-based serverless functions
- **Real-time**: Supabase Realtime subscriptions (limited use)

### External Services
- **Email**: Resend API (NO Twilio)
- **Payments**: Stripe (subscriptions + one-time purchases)
- **Email Notifications Only**: Email via Resend (NO push notifications)
- **Maps/Geocoding**: Google Maps API for address autocomplete

## Core Database Tables

### User Management
- **profiles**: Main user table (customers, businesses, admins)
  - `id` (PK, matches auth.users.id)
  - `type` (customer | business | admin)
  - `email`, `phone`, `name`, `first_name`, `last_name`
  - `address`, `city`, `state`, `zipcode`
  - `verified` (boolean - different meaning for customer vs business)

- **business_info**: Extended business data (1:1 with business profiles)
  - `id` (PK/FK to profiles)
  - `business_name`, `license_number`, `license_type`, `license_state`
  - `verified` (business verification status)

### Reviews & Responses
- **reviews**: Customer reviews written by businesses
  - `id` (PK)
  - `business_id` (FK to profiles - who wrote the review)
  - `rating`, `content`, `created_at`
  - `customer_name`, `customer_phone`, `customer_address`, etc.
  - `customer_nickname`, `customer_business_name` (optional display fields)
  - `associates` (JSONB array of up to 3 associates)
  - `is_anonymous` (boolean - hides review from business)

- **review_photos**: Photos attached to reviews
  - `id` (PK)
  - `review_id` (FK)
  - `photo_url` (Supabase Storage path)
  - `display_order`

- **responses**: Business responses to reviews (legacy - being replaced by conversations)
  - `id` (PK)
  - `review_id` (FK)
  - `author_id` (FK to profiles)
  - `content`

### Conversation System
- **conversation_participants**: Tracks who's in a conversation
  - `id` (PK)
  - `review_id` (FK - unique, one conversation per review)
  - `customer_id`, `business_id` (participants)
  - `first_customer_response_at` (when customer claimed review)

- **review_conversations**: Individual messages in conversations
  - `id` (PK)
  - `review_id` (FK)
  - `author_id` (FK to profiles)
  - `author_type` (business | customer)
  - `content`, `message_order`
  - **Turn-based**: Messages alternate between business and customer

### Access Control & Billing
- **review_claims**: Tracks which reviews have been unlocked
  - `id` (PK)
  - `review_id` (FK - unique)
  - `claimed_by` (FK to profiles)
  - `claim_type` (credit_unlock | subscription_response | direct_claim)
  - `credit_transaction_id` (optional FK)

- **credits**: User credit balances
  - `id` (PK)
  - `user_id` (FK)
  - `balance` (integer)

- **credit_transactions**: Credit purchase/usage history
  - `id` (PK)
  - `user_id` (FK)
  - `amount` (positive for purchase, negative for usage)
  - `type` (purchase | usage)
  - `stripe_session_id` (optional)

- **subscriptions**: Active subscriptions
  - `id` (PK)
  - `user_id` (FK)
  - `type` (subscription tier)
  - `status` (active | cancelled | expired)
  - `expires_at`

- **subscribers**: Stripe subscription tracking
  - `id` (PK)
  - `email`, `stripe_customer_id`
  - `subscribed` (boolean)
  - `subscription_tier`
  - `subscription_end`

### Verification & Security
- **email_verification_codes**: 6-digit codes for email verification
  - `id` (PK)
  - `email`, `code`, `expires_at`, `used`

- **verification_codes**: Phone verification codes (NOTE: Currently unused - phone verification removed)
  - `id` (PK)
  - `phone`, `code`, `expires_at`
  - `verification_type`

- **verification_requests**: Manual business verification requests
  - `id` (PK)
  - `user_id` (FK)
  - `business_name`, `primary_license`, `business_type`
  - `status` (pending | approved | rejected)
  - `verification_token`

- **auth_rate_limits**: Rate limiting for auth attempts
  - `identifier` (email or phone)
  - `attempt_type`, `attempts`, `blocked_until`

- **security_audit_log**: Security event logging
  - `user_id`, `event_type`, `event_description`
  - `ip_address`, `user_agent`, `metadata`

### Notifications
- **notification_preferences**: User notification settings
  - `user_id` (FK)
  - `email_notifications`, `push_notifications` (booleans)
  - `new_reviews`, `review_responses`, `customer_responses` (channel toggles)

- **notifications_log**: Notification delivery history
  - `id` (PK)
  - `user_id`, `notification_type`, `channel`
  - `status` (sent | failed)
  - `error_message`

- **device_tokens**: Push notification device tokens
  - `user_id`, `token`, `platform` (ios | android | web)

### Guest Access
- **guest_access**: Time-limited review access tokens
  - `id` (PK)
  - `review_id` (FK)
  - `access_token` (UUID)
  - `expires_at` (24 hours from creation)
  - `stripe_session_id` (for paid access)

## Key Database Functions (RPC)

### Credit Management
- **update_user_credits**(user_id, amount, type, description, stripe_session_id)
  - Atomically updates credit balance and creates transaction record

### Review Access
- **claim_review**(review_id, claimed_by, claim_type, credit_transaction_id)
  - Atomically claims a review, preventing duplicate claims
  - Returns boolean (true if successful, false if already claimed)

- **claim_review_via_conversation**(review_id, customer_id, content)
  - Customer claims review by starting a conversation
  - Creates conversation_participants + first message
  - Returns message ID

### Conversation Management
- **add_conversation_message**(review_id, author_id, author_type, content)
  - Adds message to existing conversation
  - Auto-increments message_order
  - Returns message ID

### Verification
- **validate_verification_code**(code, identifier, type)
  - Validates phone verification codes (currently unused)

### Security
- **check_rate_limit**(identifier, attempt_type, max_attempts, window_minutes, block_minutes)
  - Returns boolean - true if within limits, false if rate limited

- **log_security_event**(user_id, event_type, event_description, ip_address, user_agent, metadata)
  - Logs security-relevant events

## File Organization

```
src/
├── components/          # React components
│   ├── signup/          # Signup flows (business & customer)
│   ├── reviews/         # Review creation/display
│   ├── search/          # Customer search components
│   ├── conversation/    # Conversation UI
│   ├── billing/         # Billing/credits UI
│   ├── profile/         # Profile management
│   └── ui/              # Reusable UI components (shadcn)
├── pages/               # Route pages
├── hooks/               # Custom React hooks
│   ├── useCustomerSearch.ts
│   ├── useReviewSubmission.ts
│   ├── useCredits.ts
│   ├── useConversation.ts
│   └── ...
├── services/            # Business logic services
│   ├── reviewSubmissionService.ts
│   ├── conversationService.ts
│   ├── photoUploadService.ts
│   └── ...
├── contexts/            # React contexts
│   └── auth/            # Auth context & hooks
├── integrations/        # External service integrations
│   └── supabase/        # Supabase client & types
└── utils/               # Utility functions

supabase/functions/      # Edge Functions (Deno)
├── verify-email-code/   # Email verification & account creation
├── send-notification/   # Email notifications via Resend
├── conversation-notification/  # Conversation push notifications
├── stripe-webhook/      # Stripe payment webhooks
├── process-credit-purchase/    # Credit purchase processing
├── create-checkout/     # Stripe checkout session creation
└── ...
```

## Authentication Flow

### Account Types
1. **Customer**: Regular users who have reviews written about them
2. **Business**: Verified businesses who write reviews
3. **Admin**: Platform administrators

### Email Verification (Both Customer & Business)
- Required for all accounts
- 6-digit code sent via Resend
- Code expires after 10 minutes
- Edge function: `verify-email-code`
  - Validates code
  - Creates auth user (email_confirm: true)
  - Creates profile record
  - Auto-signs in user
  - Returns session tokens

### Phone Verification (REMOVED)
- Phone verification WAS planned but is NOT currently implemented
- Phone is collected but NOT verified
- Tables exist (`verification_codes`) but are unused

### Business Verification
1. **License Lookup** (attempted during signup)
   - Uses external API to verify license number
   - If verified: business gets verified badge immediately
   - If not verified: account created as unverified

2. **Manual Verification** (fallback)
   - User submits verification request
   - Admin reviews via `AdminVerifyBusiness` page
   - Admin can approve/reject
   - Edge function: `verify-business`

## Billing System

### Credits (One-Time Purchase)
- 1 credit = unlock 1 review
- Purchased via Stripe Checkout
- Process:
  1. User clicks "Buy Credits"
  2. `create-checkout` creates Stripe session
  3. User completes payment
  4. `stripe-webhook` receives `checkout.session.completed`
  5. `process-credit-purchase` adds credits to account
  6. Credits appear in user balance

### Subscriptions (Recurring)
- Business Premium: Unlimited review responses
- Customer Premium: (planned features)
- Process:
  1. User selects plan
  2. `create-checkout` creates subscription session
  3. User completes payment
  4. `stripe-webhook` updates `subscribers` table
  5. User can now respond to reviews without credits

## Email Notifications

### Sent Via Resend API
- From address: `reports@trustyreview.com` (review reports)
- Edge function: `send-notification`

### Types
1. **Review Reports** (currently implemented)
   - When user reports a review
   - Sent to: admin email
   - Contains: reporter info, review ID, complaint

2. **Conversation Notifications** (implemented via `conversation-notification`)
   - When new message in conversation
   - Sent to: other participant
   - Checks: notification_preferences.review_responses

3. **Other Types** (to be implemented)
   - New review notification (to business)
   - Response notification (to customer)

## Push Notifications

### NOT IMPLEMENTED
- Push notifications are NOT currently active
- All notifications are sent via email only (Resend)
- Legacy tables `device_tokens` and push-related fields in `notification_preferences` exist but are unused
- Email notifications handle: conversation messages, new reviews, responses

## Storage

### Supabase Storage Buckets
1. **review-photos**: Review photo uploads
   - Path format: `{userId}/{reviewId}/{timestamp}-{filename}`
   - Public read access (for unlocked reviews)

2. **avatars**: User profile photos
   - Path format: `{userId}/{timestamp}-{filename}`
   - Public read access

### Upload Process
1. Client uploads directly to Supabase Storage
2. Returns public URL
3. URL saved to database (`review_photos.photo_url` or `profiles.avatar`)

## Search System

### Search Types
1. **Profile Search**: Searches `profiles` table for existing customer accounts
2. **Review Search**: Searches `reviews` table for customer info in reviews

### Search Parameters
- First name, last name
- Business name (for customers who own businesses)
- Phone number
- Address, city, state, zipcode

### Fuzzy Matching
- Optional similarity threshold (default 0.7)
- Uses PostgreSQL `similarity()` function with pg_trgm extension

### Associate Matching
- Reviews can have up to 3 associates
- Search checks if query matches any associate
- Results flagged with `isAssociateMatch: true`

### Access Control
- Businesses can only see reviews they've unlocked
- Search results filtered by `review_claims` table
- Hook: `useReviewAccess()` tracks unlocked review IDs

## Guest Access System

### Purpose
Allow customers to view reviews about them without creating account

### Flow
1. Customer receives link with access token
2. Token stored in `guest_access` table
3. Token valid for 24 hours
4. No authentication required
5. Edge function: `handle-guest-access`

### Security
- UUID token (cryptographically random)
- Time-limited expiry
- Single review access per token
- No write permissions

## Row Level Security (RLS)

### Key Policies
- **profiles**: Users can read all, update only their own
- **reviews**: Businesses can read reviews they've unlocked
- **review_claims**: Users can see their own claims
- **credits**: Users can only see their own credits
- **subscriptions**: Users can only see their own subscriptions
- **conversation_participants**: Participants can read their conversations
- **review_conversations**: Conversation participants can read messages

### Admin Bypass
- Admin users have elevated permissions
- Checked via `get_user_role()` function

## Performance Optimizations

### Caching
- Search results cached client-side (5 min TTL)
- Profile data cached in React Query

### Debouncing
- Search queries debounced (300ms)
- Form inputs debounced where appropriate

### Lazy Loading
- Review photos loaded on demand
- Conversation messages paginated (if needed)

### Optimistic Updates
- Credits deducted optimistically
- Conversation messages appear immediately

## Security Measures

### Rate Limiting
- Auth attempts tracked in `auth_rate_limits`
- Configurable max attempts per time window
- Lockout after threshold exceeded

### Audit Logging
- Security events logged to `security_audit_log`
- Includes IP address, user agent, metadata
- Events: login, signup, password reset, review claims

### Content Validation
- XSS protection via DOMPurify
- Input sanitization
- SQL injection prevented by Supabase RLS + parameterized queries

### Session Management
- JWT tokens managed by Supabase Auth
- Automatic token refresh
- Secure httpOnly cookies

## Mobile Considerations

### Platform Support
- iOS (via Capacitor)
- Android (via Capacitor)
- Progressive Web App (PWA) fallback

### Mobile-Specific Features
- Camera integration for photo uploads
- Status bar theming
- Share functionality
- Keyboard handling

### Responsive Design
- Mobile-first approach
- Tailwind breakpoints
- Touch-optimized UI
- Bottom navigation for mobile

## Error Handling

### Frontend
- Toast notifications via sonner
- Form validation via Zod + React Hook Form
- Network error retry logic (React Query)
- Graceful degradation

### Backend
- Edge function try/catch blocks
- Database constraint violations
- Rate limit errors
- Stripe webhook validation

## Monitoring & Logging

### Frontend Logging
- Console logs for development
- Error boundaries for production
- User-facing error messages

### Backend Logging
- Edge function console logs
- Notification delivery tracking (`notifications_log`)
- Security audit events
- Stripe webhook events

## Deployment

### Frontend
- Vite production build
- Hosted on Netlify/Vercel (assumed)
- Environment variables for API keys

### Backend
- Supabase hosted PostgreSQL
- Edge Functions deployed via Supabase CLI
- Automatic migrations via Supabase Migrations

### Mobile
- iOS: TestFlight → App Store
- Android: Internal testing → Google Play
- Build via Capacitor CLI
