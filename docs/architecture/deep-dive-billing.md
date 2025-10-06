# Deep Dive: Billing & Credits System

## Overview
Welp uses Stripe for payment processing. The system supports:
1. **Credits** (one-time purchase) - Buy credits to unlock individual reviews
2. **Subscriptions** (recurring) - Monthly subscription for unlimited review responses

---

## Credits System

### How Credits Work
- 1 credit = ability to unlock 1 review
- Credits are purchased in packages (e.g., 10 credits for $9.99)
- Credits never expire
- Credits are deducted when unlocking a review
- Balance tracked in `credits` table

### Credit Purchase Flow

#### User Journey
1. Business navigates to `/buy-credits` or clicks "Buy Credits" button
2. Selects credit package (10, 25, 50, or 100 credits)
3. Clicks "Purchase" button
4. Redirected to Stripe Checkout
5. Completes payment on Stripe
6. Stripe webhook fires `checkout.session.completed`
7. `process-credit-purchase` edge function processes payment
8. Credits added to account via `update_user_credits` RPC
9. User redirected back to app with success message
10. Credits immediately available for use

#### Frontend Implementation

**Page**: `src/pages/BuyCredits.tsx`
- Shows credit packages with pricing
- Each package has "Purchase" button
- Uses `useCredits` hook

**Hook**: `src/hooks/useCredits.ts`
- `processSuccessfulPurchase(sessionId)` function (line 73-99):
  - Called after redirect from Stripe
  - Invokes `process-credit-purchase` edge function
  - Refreshes credit balance
  - Shows success toast

**Checkout Creation**:
```typescript
const { data, error } = await supabase.functions.invoke('create-checkout', {
  body: {
    priceId: 'price_xxx', // Stripe Price ID
    successUrl: `${window.location.origin}/buy-credits?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${window.location.origin}/buy-credits?cancelled=true`,
    mode: 'payment', // One-time payment
    metadata: {
      credits: 10,
      userId: currentUser.id
    }
  }
});

// Redirect to Stripe Checkout
window.location.href = data.url;
```

#### Backend Implementation

**Edge Function 1**: `supabase/functions/create-checkout/index.ts`
- Creates Stripe Checkout session
- Input: `{ priceId, successUrl, cancelUrl, mode, metadata }`
- Process:
  1. Get or create Stripe customer for user
  2. Create checkout session:
     ```typescript
     const session = await stripe.checkout.sessions.create({
       customer: stripeCustomerId,
       mode: 'payment',
       line_items: [{ price: priceId, quantity: 1 }],
       success_url: successUrl,
       cancel_url: cancelUrl,
       metadata: metadata
     });
     ```
  3. Return session URL
- Returns: `{ url: session.url }`

**Edge Function 2**: `supabase/functions/stripe-webhook/index.ts`
- Receives webhooks from Stripe
- Handles: `checkout.session.completed`
- Process (for payment mode):
  1. Verify webhook signature (currently skipped for testing)
  2. Extract session data
  3. For credit purchases: No immediate action (handled by process-credit-purchase)
  4. For subscriptions: Update `subscribers` table

**Edge Function 3**: `supabase/functions/process-credit-purchase/index.ts`
- Called by frontend after successful payment
- Input: `{ sessionId }`
- Process:
  1. Retrieve session from Stripe:
     ```typescript
     const session = await stripe.checkout.sessions.retrieve(sessionId);
     ```
  2. Verify payment was successful: `session.payment_status === 'paid'`
  3. Extract credits from metadata: `session.metadata.credits`
  4. Extract user ID from metadata: `session.metadata.userId`
  5. Call `update_user_credits` RPC:
     ```typescript
     await supabase.rpc('update_user_credits', {
       p_user_id: userId,
       p_amount: credits,
       p_type: 'purchase',
       p_description: `Purchased ${credits} credits`,
       p_stripe_session_id: sessionId
     });
     ```
  6. Return success message

**RPC Function**: `update_user_credits(p_user_id, p_amount, p_type, p_description, p_stripe_session_id)`
- Location: Supabase database function
- Process:
  1. Upsert credits balance:
     ```sql
     INSERT INTO credits (user_id, balance)
     VALUES (p_user_id, p_amount)
     ON CONFLICT (user_id)
     DO UPDATE SET balance = credits.balance + p_amount, updated_at = NOW()
     ```
  2. Insert transaction record:
     ```sql
     INSERT INTO credit_transactions (user_id, amount, type, description, stripe_session_id)
     VALUES (p_user_id, p_amount, p_type, p_description, p_stripe_session_id)
     ```
- **ATOMIC**: Both operations in single transaction

#### Database Operations

**UPSERT**: `credits`
```sql
{
  user_id: UUID (PK, FK to profiles),
  balance: number (integer),
  updated_at: timestamp
}
```

**INSERT**: `credit_transactions`
```sql
{
  id: UUID (PK),
  user_id: UUID (FK to profiles),
  amount: number (integer, positive),
  type: 'purchase',
  description: "Purchased 10 credits",
  stripe_session_id: string,
  created_at: timestamp
}
```

### Credit Usage Flow

#### User Journey
1. User finds locked review
2. Clicks "Unlock Review (1 credit)"
3. Credit deducted from balance
4. Review claimed
5. Full review content revealed

#### Frontend Implementation

**Hook**: `src/hooks/useCredits.ts`
- `useCredits(amount, description)` function (line 101-148):
  1. Check balance >= amount
  2. Call `update_user_credits` RPC with negative amount
  3. Get transaction ID from `credit_transactions` table
  4. Return `{ success: true, transactionId }`

**Usage Example**:
```typescript
const { useCredits } = useCredits();
const { claimReview } = useReviewClaims();

// Deduct credit
const { success, transactionId } = await useCredits(1, 'Unlock review');

// Claim review with transaction ID
if (success) {
  await claimReview(reviewId, 'credit_unlock', transactionId);
}
```

#### Backend Implementation

**RPC Call**: Same `update_user_credits` function
- Called with negative amount: `p_amount: -1`
- Transaction type: `p_type: 'usage'`
- Description: `p_description: 'Unlock review'`

**Database Operations**:

**UPDATE**: `credits`
```sql
UPDATE credits
SET balance = balance - 1, updated_at = NOW()
WHERE user_id = p_user_id
```

**INSERT**: `credit_transactions`
```sql
{
  user_id: UUID,
  amount: -1,
  type: 'usage',
  description: 'Unlock review',
  created_at: timestamp
}
```

### Credit Balance Display

**Component**: `src/components/billing/CreditsBalanceCard.tsx`
- Shows current balance
- "Buy More Credits" button
- Link to transaction history

**Hook**: `src/hooks/useCredits.ts`
- `balance` state
- `loadCreditsData()` function
- Query: `SELECT * FROM credits WHERE user_id = {currentUserId}`

### Transaction History

**Component**: `src/components/billing/TransactionHistoryCard.tsx`
- Table showing all transactions
- Columns: Date, Type, Amount, Description
- Sorted by date (newest first)

**Hook**: `src/hooks/useCredits.ts`
- `transactions` state
- Query:
  ```sql
  SELECT * FROM credit_transactions
  WHERE user_id = {currentUserId}
  ORDER BY created_at DESC
  LIMIT 50
  ```

---

## Subscription System

### How Subscriptions Work
- Monthly recurring billing via Stripe
- **Business Premium**: Unlimited review responses, no credit usage
- **Customer Premium** (planned): Additional features TBD
- Active subscribers bypass credit requirements

### Subscription Purchase Flow

#### User Journey
1. User navigates to `/subscription` page
2. Views plan options (Free, Business Premium)
3. Clicks "Subscribe" on Business Premium
4. Redirected to Stripe Checkout
5. Completes payment on Stripe
6. Stripe webhook updates subscription status
7. User redirected back to app
8. Subscription active immediately
9. Can now respond to unlimited reviews

#### Frontend Implementation

**Page**: `src/pages/Subscription.tsx`
- Shows subscription tiers
- Current subscription status
- "Subscribe" or "Manage Subscription" buttons

**Component**: `src/components/subscription/SubscriptionPlans.tsx`
- Plan cards with features
- Pricing display
- CTA buttons

**Subscription Check**:
```typescript
const { isSubscribed } = useAuth();

if (isSubscribed) {
  // Allow review response without credit check
} else {
  // Require credit or subscription
}
```

**Checkout Creation**:
```typescript
const { data } = await supabase.functions.invoke('create-checkout', {
  body: {
    priceId: 'price_business_premium',
    successUrl: `${window.location.origin}/subscription?success=true`,
    cancelUrl: `${window.location.origin}/subscription?cancelled=true`,
    mode: 'subscription', // Recurring payment
    metadata: {
      user_type: 'business',
      userId: currentUser.id
    }
  }
});

window.location.href = data.url;
```

#### Backend Implementation

**Edge Function**: `supabase/functions/create-checkout/index.ts`
- Same function as credit purchases
- Different `mode: 'subscription'`
- Different `priceId` for subscription products

**Edge Function**: `supabase/functions/stripe-webhook/index.ts`
- Handles subscription events (line 44-74):

**Event: checkout.session.completed (subscription mode)**:
```typescript
if (session.mode === "subscription") {
  const customer = await stripe.customers.retrieve(session.customer);
  const subscription = await stripe.subscriptions.retrieve(session.subscription);

  const userType = session.metadata?.user_type || 'customer';

  await supabaseClient.from("subscribers").upsert({
    email: customer.email,
    stripe_customer_id: customer.id,
    subscribed: true,
    subscription_tier: userType === "business" ? "Business Premium" : "Customer Premium",
    subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
    user_type: userType,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'email' });
}
```

**Event: customer.subscription.updated** (line 77-101):
```typescript
const subscription = event.data.object;
const customer = await stripe.customers.retrieve(subscription.customer);

const isActive = subscription.status === 'active';

await supabaseClient.from("subscribers")
  .update({
    subscribed: isActive,
    subscription_end: isActive ? new Date(subscription.current_period_end * 1000).toISOString() : null,
    updated_at: new Date().toISOString(),
  })
  .eq('stripe_customer_id', customer.id);
```

**Event: customer.subscription.deleted**:
- Same as `updated`, sets `subscribed: false`

#### Database Operations

**UPSERT**: `subscribers`
```sql
{
  email: string (PK),
  stripe_customer_id: string,
  subscribed: boolean,
  subscription_tier: "Business Premium" | "Customer Premium",
  subscription_end: timestamp,
  user_type: "business" | "customer",
  user_id: UUID (nullable, FK to profiles),
  created_at: timestamp,
  updated_at: timestamp
}
```

**INSERT/UPDATE**: `subscriptions` (legacy, may not be used)
```sql
{
  id: UUID (PK),
  user_id: UUID (FK to profiles),
  type: string,
  status: 'active' | 'cancelled' | 'expired',
  started_at: timestamp,
  expires_at: timestamp,
  created_at: timestamp,
  updated_at: timestamp
}
```

### Subscription Status Check

**Hook**: `src/contexts/auth/hooks/useSubscriptionStatus.ts`
- Queries `subscribers` table on user load
- Checks if `email = currentUser.email AND subscribed = true`
- Sets `isSubscribed` flag in auth context

**Usage**:
```typescript
const { isSubscribed } = useAuth();

if (isSubscribed) {
  // Bypass credit requirement
  await claimReview(reviewId, 'subscription_response');
}
```

### Customer Portal

**User Journey**:
1. User clicks "Manage Subscription"
2. Redirected to Stripe Customer Portal
3. Can view invoices, update payment method, cancel subscription
4. Returns to app

**Implementation**:
```typescript
const { data } = await supabase.functions.invoke('customer-portal', {
  body: {
    returnUrl: `${window.location.origin}/subscription`
  }
});

window.location.href = data.url;
```

**Edge Function**: `supabase/functions/customer-portal/index.ts`
- Gets Stripe customer ID for user
- Creates portal session:
  ```typescript
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: returnUrl
  });
  ```
- Returns portal URL

---

## Billing Page

### Layout
**Page**: `src/pages/BillingPage.tsx`

### Sections
1. **Credits Balance** (`CreditsBalanceCard`)
   - Current balance
   - Buy credits button

2. **Current Subscription** (`CurrentSubscriptionCard`)
   - Plan name
   - Renewal date
   - Manage button

3. **Payment Methods** (`PaymentMethodsCard`)
   - Saved payment methods from Stripe
   - Add/remove cards

4. **Transaction History** (`TransactionHistoryCard`)
   - Credit purchases
   - Credit usage
   - Subscription payments

### Data Loading
**Hook**: `src/hooks/useBillingData.ts`
- Loads:
  - Credit balance
  - Transaction history
  - Subscription status
  - Stripe customer info
- Combines multiple queries
- Cached via React Query

---

## Stripe Configuration

### Products
1. **Credits**:
   - 10 credits: $9.99
   - 25 credits: $19.99
   - 50 credits: $34.99
   - 100 credits: $59.99

2. **Subscriptions**:
   - Business Premium: $29.99/month
   - Customer Premium: $9.99/month (planned)

### Webhook Setup
- Endpoint: `{SUPABASE_URL}/functions/v1/stripe-webhook`
- Events:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
- Signing secret: Stored in Supabase Secrets

### Test Mode
- Use Stripe test keys for development
- Test card: `4242 4242 4242 4242`
- Production keys for live environment

---

## Database Schema

### credits
```sql
CREATE TABLE credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_credits_user_id ON credits(user_id);
```

### credit_transactions
```sql
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'usage')),
  description TEXT,
  stripe_session_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at DESC);
```

### subscribers
```sql
CREATE TABLE subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT,
  subscribed BOOLEAN DEFAULT false,
  subscription_tier TEXT,
  subscription_end TIMESTAMP,
  user_type TEXT DEFAULT 'customer',
  user_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_subscribers_email ON subscribers(email);
CREATE INDEX idx_subscribers_stripe_customer ON subscribers(stripe_customer_id);
```

---

## RLS Policies

### credits
```sql
CREATE POLICY "users_view_own_credits" ON credits
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "rpc_can_update_credits" ON credits
FOR ALL USING (true); -- Controlled by RPC function
```

### credit_transactions
```sql
CREATE POLICY "users_view_own_transactions" ON credit_transactions
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "rpc_can_insert_transactions" ON credit_transactions
FOR INSERT WITH CHECK (true); -- Controlled by RPC function
```

### subscribers
```sql
CREATE POLICY "users_view_own_subscription" ON subscribers
FOR SELECT USING (email = auth.email());
```

---

## Error Handling

### Insufficient Credits
```typescript
if (balance < amount) {
  toast.error("Insufficient credits. Please purchase more.");
  return { success: false };
}
```

### Stripe Payment Failed
- User stays on Stripe Checkout
- Error shown by Stripe
- User can retry or cancel

### Webhook Delivery Failure
- Stripe automatically retries
- Manual reconciliation via Stripe Dashboard if needed

### Duplicate Purchase Prevention
- Stripe session IDs tracked in `credit_transactions`
- Check for existing transaction with same session ID
- Prevent double-crediting

---

## Common Issues & Solutions

### Issue: Credits not added after payment
**Solution**: Check stripe-webhook logs, verify session ID, manually call process-credit-purchase

### Issue: Subscription not activated
**Solution**: Check subscribers table, verify Stripe webhook delivery, check email match

### Issue: Can't access Stripe Customer Portal
**Solution**: Verify user has stripe_customer_id in subscribers table

### Issue: Credit balance incorrect
**Solution**: Review credit_transactions table, recalculate balance, use update_user_credits to correct
