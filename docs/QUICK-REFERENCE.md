# Quick Reference

Fast feature and capability lookup for AI agents.

## Core Features

### Review System
- **Submit Review**: Customer writes review → `reviews` table → Business notified
- **Anonymous Reviews**: `reviews.anonymous=true`, tracked via `customer_review_associations`
- **Respond to Review**: Business uses credits/subscription → `responses` table
- **Review Photos**: Upload to `review_photos` table, stored in Supabase Storage
- **Conversations**: Back-and-forth messaging on reviews via `review_conversations`

### Authentication
- **Signup**: Email + phone verification via Resend
- **Login**: Supabase Auth + session management
- **Roles**: `customer` or `business` in `profiles.role`
- **Verification**: Email OTP and phone OTP via `email_verification_codes`, `verification_codes`

### Billing
- **Credits**: Purchase via Stripe → `credit_transactions`, `credits.balance`
- **Subscriptions**: Monthly/annual via Stripe → `subscriptions`, `subscribers`
- **Response Cost**: 1 credit or active subscription required

### Business Features
- **Verification**: License lookup → Verification badge
- **Business Profile**: `business_info` table with address, license, etc.
- **Customer Access**: Grant specific customers access via `customer_access`

### Search
- **Customer Search**: Find businesses by name, location, type
- **Business Search**: Find reviews about your business
- **Guest Access**: Time-limited review access via shareable token

## Quick File Lookups

### Key Frontend Files
- `src/pages/NewReview.tsx` - Review submission
- `src/pages/BusinessProfile.tsx` - Business profile display
- `src/pages/Profile.tsx` - User profile management
- `src/pages/Credits.tsx` - Credit purchase
- `src/pages/Subscription.tsx` - Subscription management

### Key Services
- `src/services/reviewSubmissionService.ts` - Review logic
- `src/services/authService.ts` - Authentication
- `src/services/creditService.ts` - Credit operations

### Key Hooks
- `src/hooks/useReviewSubmission.ts` - Review submission
- `src/hooks/useAuth.ts` - Authentication state
- `src/hooks/useCredits.ts` - Credit balance

## Database Quick Lookup

See `docs/database/QUICK_REFERENCE.md` for complete table reference.

## Edge Functions Quick Lookup

See `docs/edge-functions/README.md` for complete function reference.

## Common Workflows

### User Signs Up
1. Submit signup form → `signup` Edge Function
2. Create `profiles` record
3. Send email verification → `send-email-verification`
4. Send phone verification → `send-verification-code`
5. Verify codes → `verify-email-code`, `verify-phone`
6. Account ready

### Customer Writes Review
1. Fill review form → Submit
2. Insert `reviews` record
3. Upload photos → `review_photos`
4. Create `customer_review_associations` (if anonymous)
5. Send notification → `send-notification` Edge Function
6. Business owner receives email

### Business Responds
1. Check credits/subscription
2. Write response → Submit
3. Insert `responses` record
4. Deduct credit or check subscription
5. Send notification to customer
6. Customer receives email

### Credit Purchase
1. Select credit amount → `create-credit-payment`
2. Stripe checkout session
3. User pays
4. Stripe webhook → `stripe-webhook`
5. Insert `credit_transactions`
6. Update `credits.balance`

For detailed flows see `docs/architecture/deep-dive-*.md` files.
