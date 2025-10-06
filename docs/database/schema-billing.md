# Billing Schema

Credits and subscription system integrated with Stripe.

## Tables in This Domain

1. `credits` - User credit balances
2. `credit_transactions` - Credit purchase and usage history
3. `subscriptions` - Stripe subscription management
4. `subscribers` - Subscription relationships

---

## credits

User credit balances for unlocking review response capabilities.

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| user_id | uuid | NO | - | User who owns these credits (links to auth.users) |
| balance | integer | NO | 0 | Current credit balance |
| created_at | timestamptz | NO | now() | Record creation (UTC) |
| updated_at | timestamptz | NO | now() | Last update (UTC) |

### Constraints

- **Primary Key**: `id`
- **Foreign Key**: `user_id` → `auth.users(id)` ON DELETE CASCADE
- **Unique**: `user_id` (one credit record per user)

### RLS

- **Enabled**: Yes
- **Policies**: Users can read their own credit balance; service role can update

### Used In

- `src/pages/Credits.tsx` - Credit balance display
- `src/hooks/useCredits.ts` - Credit balance access
- `src/services/creditService.ts` - Credit operations

### Credit Usage

**Costs**:
- Responding to a review: 1 credit (if no subscription)

**Subscription Override**:
- Users with active subscription in `subscriptions` table bypass credit cost

### Related Tables

- **References**: `auth.users(user_id)`
- **Referenced by**: `credit_transactions` (tracks balance changes)

---

## credit_transactions

Credit purchase and usage history.

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| user_id | uuid | NO | - | User this transaction belongs to (links to auth.users) |
| type | text | NO | - | Type of transaction: 'purchase', 'usage', 'refund' |
| amount | integer | NO | - | Credit amount (positive = purchase, negative = usage) |
| description | text | YES | NULL | Human-readable description |
| stripe_session_id | text | YES | NULL | Stripe session ID (for purchases) |
| created_at | timestamptz | NO | now() | Transaction timestamp (UTC) |

### Constraints

- **Primary Key**: `id`
- **Foreign Key**: `user_id` → `auth.users(id)` ON DELETE CASCADE
- **Check**: `type IN ('purchase', 'usage', 'refund')`

### Indexes

- `user_id` (B-tree) - Lookup transactions for user
- `created_at` (B-tree) - Chronological ordering

### RLS

- **Enabled**: Yes
- **Policies**: Users can read their own transactions; service role can create

### Transaction Types

- `purchase` - User bought credits (amount > 0)
- `usage` - User spent credits (amount < 0)
- `refund` - Credits refunded (amount > 0)

### Used In

- `src/pages/TransactionHistory.tsx` - Display transaction history
- `src/hooks/useCreditTransactions.ts` - Transaction access
- `src/services/creditService.ts` - Transaction creation

### Credit Balance Calculation

Current balance = SUM(amount) from all transactions for user_id

The `credits.balance` column should match this sum.

### Related Tables

- **References**: `auth.users(user_id)`
- **Referenced by**: `review_claims` (links claims to transactions)

---

## subscriptions

Stripe subscription management.

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| user_id | uuid | YES | NULL | User who owns subscription (links to profiles) |
| type | text | NO | - | Subscription type/tier |
| status | text | NO | - | Subscription status |
| started_at | timestamptz | NO | now() | Subscription start (UTC) |
| expires_at | timestamptz | YES | NULL | Subscription end (UTC) |
| created_at | timestamptz | NO | now() | Record creation (UTC) |
| updated_at | timestamptz | NO | now() | Last update (UTC) |

### Constraints

- **Primary Key**: `id`
- **Foreign Key**: `user_id` → `profiles(id)` ON DELETE CASCADE

### Indexes

- `user_id` (B-tree) - Lookup subscriptions for user
- `status` (B-tree) - Filter active subscriptions
- `expires_at` (B-tree) - Find expiring subscriptions

### RLS

- **Enabled**: Yes
- **Policies**: Users can read their own subscriptions; service role can update

### Subscription Statuses

- `active` - Subscription is active
- `canceled` - Subscription canceled
- `expired` - Subscription expired

### Used In

- `src/pages/Subscription.tsx` - Subscription management
- `src/hooks/useSubscription.ts` - Subscription access

### Access Control

Users with `status = 'active'` get unlimited review responses (no credit cost).

### Related Tables

- **References**: `profiles(user_id)`
- **Referenced by**: None

---

## subscribers

Subscription relationships linking users to subscription status.

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| user_id | uuid | YES | NULL | User who owns subscription (links to auth.users) |
| email | text | NO | - | Subscriber email (unique) |
| stripe_customer_id | text | YES | NULL | Stripe customer ID |
| subscription_tier | text | YES | NULL | Subscription tier |
| subscription_end | timestamptz | YES | NULL | Subscription end date (UTC) |
| subscribed | boolean | NO | false | Active subscription status |
| user_type | text | NO | 'customer' | User type: 'customer' or 'business' |
| created_at | timestamptz | NO | now() | Record creation (UTC) |
| updated_at | timestamptz | NO | now() | Last update (UTC) |

### Constraints

- **Primary Key**: `id`
- **Foreign Key**: `user_id` → `auth.users(id)` ON DELETE CASCADE
- **Unique**: `email`

### Indexes

- `user_id` (B-tree) - Lookup subscriptions for user
- `email` (B-tree) - Lookup by email

### RLS

- **Enabled**: Yes
- **Policies**: Users can read their own subscription relationships

### Used In

- `src/hooks/useSubscription.ts` - Check if user has active subscription
- `src/services/subscriptionService.ts` - Subscription access control

### Subscription Check

To determine if user has active subscription:
```sql
SELECT * FROM subscribers
WHERE user_id = '...'
AND subscribed = true
AND (subscription_end IS NULL OR subscription_end > NOW());
```

### Related Tables

- **References**: `auth.users(user_id)`
- **Referenced by**: None

---

## Summary

**Total Tables**: 4

**Key Relationships**:
- `auth.users` ← `credits.user_id` (one-to-one)
- `auth.users` ← `credit_transactions.user_id` (one-to-many)
- `profiles` ← `subscriptions.user_id` (one-to-many)
- `auth.users` ← `subscribers.user_id` (one-to-many)

**Billing Flow**:

**Option 1: Credit Purchase**
1. User initiates credit purchase
2. Stripe checkout session created
3. User completes payment
4. Stripe webhook triggered
5. Insert into `credit_transactions` (amount > 0)
6. Update `credits.balance`

**Option 2: Subscription**
1. User initiates subscription
2. Stripe checkout session created
3. User completes payment
4. Stripe webhook triggered
5. Insert/update `subscriptions` record
6. Insert/update `subscribers` record

**Credit Usage**:
1. User responds to review
2. Check `subscribers` or `subscriptions` for active subscription
3. If no active subscription, check `credits.balance`
4. If sufficient credits, insert into `credit_transactions` (amount < 0)
5. Update `credits.balance`

**Common Query Patterns**:
```sql
-- Check if user can respond (has credits or subscription)
SELECT
  c.balance as credit_balance,
  s.subscribed as has_subscription
FROM credits c
LEFT JOIN subscribers s ON s.user_id = c.user_id
WHERE c.user_id = '...';

-- Get transaction history
SELECT * FROM credit_transactions
WHERE user_id = '...'
ORDER BY created_at DESC;
```

See `constraints.md` for complete foreign key documentation.
