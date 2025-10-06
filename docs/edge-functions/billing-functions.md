# Billing Edge Functions

Stripe integration for credits and subscriptions.

## check-subscription

Check and update user subscription status from Stripe.

- **Path**: `supabase/functions/check-subscription/index.ts`
- **Auth Required**: Yes (JWT verified)
- **Parameters**: `{ }`
- **Returns**: `{ subscribed: boolean, subscription_end?: string, subscription_tier?: string, user_type: string }`
- **Stripe**: Queries customer and active subscriptions
- **Database**: Upserts into `subscribers` table with current status
- **Called From**: `src/hooks/useSubscription.ts`

**Flow**:
1. Get user from JWT token
2. Find Stripe customer by email
3. Check for active subscriptions
4. Determine subscription tier based on user type
5. Upsert status into `subscribers` table
6. Return subscription status

---

## create-checkout

Create Stripe checkout session for subscription.

- **Path**: `supabase/functions/create-checkout/index.ts`
- **Auth Required**: Yes (JWT verified)
- **Parameters**: `{ price_id: string }`
- **Returns**: `{ session_id, url }`
- **Stripe**: Creates checkout session
- **Database**: None (webhook handles fulfillment)
- **Called From**: `src/pages/Subscription.tsx`

---

## create-payment

Create Stripe payment intent (generic).

- **Path**: `supabase/functions/create-payment/index.ts`
- **Auth Required**: Yes (JWT verified)
- **Parameters**: `{ amount: number, currency: string }`
- **Returns**: `{ payment_intent_id, client_secret }`
- **Stripe**: Creates payment intent
- **Database**: None
- **Called From**: Various payment flows

---

## create-credit-payment

Create Stripe checkout session for credit purchase.

- **Path**: `supabase/functions/create-credit-payment/index.ts`
- **Auth Required**: Yes (JWT verified)
- **Parameters**: `{ credit_amount: number }`
- **Returns**: `{ session_id, url }`
- **Stripe**: Creates checkout session ($3 per credit)
- **Database**: None (webhook handles fulfillment)
- **Called From**: `src/pages/Credits.tsx`

---

## create-legacy-payment

Create Stripe checkout for Legacy plan (one-time $250 payment).

- **Path**: `supabase/functions/create-legacy-payment/index.ts`
- **Auth Required**: Yes (JWT verified)
- **Parameters**: `{ userType?: 'customer' | 'business' }`
- **Returns**: `{ url: string }`
- **Stripe**: Creates checkout session for $250 one-time payment
- **Database**: Reads `credits` for metadata only
- **Called From**: `src/pages/Subscription.tsx`

**Flow**:
1. Get or create Stripe customer
2. Read user credit balance for metadata
3. Create checkout session ($250 one-time)
4. Return checkout URL

**Product Details**:
- Business Legacy Plan: Lifetime access to all customer reviews and tools
- Customer Legacy Plan: Lifetime access to all reviews about them
- Price: $250 (one-time, never expires)

---

## process-credit-purchase

Process successful credit purchase after payment.

- **Path**: `supabase/functions/process-credit-purchase/index.ts`
- **Auth Required**: Yes (JWT verified)
- **Parameters**: `{ sessionId?: string, chargeId?: string }`
- **Returns**: `{ success: boolean, credits: number, message: string }`
- **Stripe**: Retrieves session or charge to verify payment
- **Database**: Calls `update_user_credits` RPC, prevents duplicate processing
- **Called From**: Frontend after successful payment

**Flow**:
1. Retrieve payment session or charge from Stripe
2. Verify payment status is 'paid' or 'succeeded'
3. Calculate credit quantity (1 credit = $3 = 300 cents)
4. Check for duplicate transactions
5. Call `update_user_credits` RPC to add credits
6. Return success with credit count

---

## process-payment-refund

Process payment refund when user has credits.

- **Path**: `supabase/functions/process-payment-refund/index.ts`
- **Auth Required**: No (uses session metadata)
- **Parameters**: `{ sessionId: string }`
- **Returns**: `{ success: boolean, refundId?: string, refundAmount?: number, creditsConsumed?: number }`
- **Stripe**: Creates refund based on credit value
- **Database**: Consumes credits via `update_user_credits` RPC
- **Called From**: Payment completion flows

**Flow**:
1. Retrieve checkout session
2. Get credit balance from session metadata
3. Calculate refund amount ($3 per credit, capped at payment amount)
4. Create Stripe refund
5. Consume credits from user balance
6. Return refund details

**Refund Caps**:
- Subscription: Max $11.99
- Legacy: Max $250

---

## get-billing-info

Get user's Stripe billing information.

- **Path**: `supabase/functions/get-billing-info/index.ts`
- **Auth Required**: Yes (JWT verified)
- **Parameters**: `{ }`
- **Returns**: `{ payment_methods: [], transactions: [] }`
- **Stripe**: Fetches payment methods and recent charges
- **Database**: None
- **Called From**: `src/pages/Billing.tsx`

**Flow**:
1. Find Stripe customer by email
2. List payment methods (cards)
3. List recent charges (last 10)
4. Format and return billing information

---

## customer-portal

Get Stripe customer portal URL.

- **Path**: `supabase/functions/customer-portal/index.ts`
- **Auth Required**: Yes (JWT verified)
- **Parameters**: `{ }`
- **Returns**: `{ url: string }`
- **Stripe**: Creates portal session
- **Database**: Reads `subscriptions` for stripe_customer_id
- **Called From**: `src/pages/Subscription.tsx`

**Note**: Deployed name is `customer-portal` (not get-customer-portal)

---

## stripe-webhook

Handle Stripe webhook events.

- **Path**: `supabase/functions/stripe-webhook/index.ts`
- **Auth Required**: No (Stripe signature verification)
- **Parameters**: Stripe event payload
- **Returns**: `{ received: true }`
- **Stripe**: Verifies webhook signature
- **Database**: Updates `subscriptions`, `credit_transactions`, `credits`
- **Called From**: Stripe (webhook)

**Events Handled**:
- `checkout.session.completed` - Fulfill subscription or credits
- `invoice.payment_succeeded` - Subscription renewed
- `invoice.payment_failed` - Subscription payment failed
- `customer.subscription.updated` - Subscription status changed
- `customer.subscription.deleted` - Subscription canceled

---

## Summary

**Total Functions**: 10

**Stripe Integration**:
- Uses `STRIPE_SECRET_KEY` from Edge Function secrets
- Webhook signature verification
- Checkout Sessions for payment collection
- Customer Portal for subscription management

**Database Tables Used**:
- `subscriptions` - Subscription records
- `subscribers` - User-subscription links
- `credits` - Credit balances
- `credit_transactions` - Transaction history

**Payment Types**:
- **Subscription**: Recurring monthly/yearly plans
- **Credits**: One-time purchase ($3 per credit)
- **Legacy**: One-time $250 lifetime access

**Fulfillment Flow**:
1. User initiates purchase (checkout session created)
2. User completes payment on Stripe
3. Stripe sends webhook to `stripe-webhook`
4. Webhook verifies signature and fulfills order
5. Credits added or subscription activated

**Called From Frontend**:
- `src/pages/Credits.tsx` - Credit purchase
- `src/pages/Subscription.tsx` - Subscription management
- `src/pages/Billing.tsx` - Billing information
- `src/hooks/useSubscription.ts` - Subscription status

**Security**:
- Webhook signature verification required
- Service role for database operations
- JWT verification for user actions
