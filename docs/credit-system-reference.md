
# Credit System Reference

## Overview
This document serves as a reference for the credit system implementation to prevent functionality breakage.

## Key Components

### 1. Credit Management Hook (`useCredits.ts`)
- Manages credit balance and transactions
- Handles credit purchases and usage
- Processes Stripe payments for credits
- Key functions:
  - `useCredits(amount, description)` - Consume credits
  - `processSuccessfulPurchase(sessionId)` - Handle successful Stripe purchases
  - `loadCreditsData()` - Refresh credit data

### 2. Transaction History Display (`TransactionHistoryCard.tsx`)
- Shows accurate Stripe charge amounts
- Properly categorizes transactions:
  - Credit purchases: Multiples of $3 (300 cents)
  - Subscriptions: $11.99 (1199 cents)
  - Legacy plan: $250 (25000 cents)
- Always displays actual Stripe amount, not converted credit amounts

### 3. Credit Usage in Reviews
- EnhancedCustomerReviewCard supports credit-based unlocking
- `handleUseCreditClick()` properly updates local state
- Star ratings are revealed when reviews are unlocked via credits
- Toast notifications confirm successful credit usage

## Critical Implementation Details

### Transaction Display Logic
```typescript
const getTransactionDescription = (stripeTransaction: Transaction, creditTransaction?: any) => {
  const amount = stripeTransaction.amount;
  
  // Legacy payment - $250 one-time payment
  if (amount === 25000) {
    return "Legacy Plan - Lifetime Access";
  }
  
  // Subscription payment - $11.99 recurring
  if (amount === 1199) {
    return "Premium Subscription";
  }
  
  // Credit purchase - multiples of $3 (300 cents)
  if (amount % 300 === 0) {
    const credits = amount / 300;
    return `Credit Purchase - ${credits} credit${credits > 1 ? 's' : ''}`;
  }
  
  return stripeTransaction.description || "Payment";
};
```

### Credit Usage Implementation
```typescript
const handleUseCreditClick = async () => {
  if (balance < 1) {
    toast.error("Insufficient credits");
    return;
  }

  const success = await useCreditsFn(1, `Unlocked review ${review.id}`);
  if (success) {
    setLocalIsUnlockedState(true);
    toast.success("Review unlocked using 1 credit!");
  }
};
```

### Star Rating Display
```typescript
const renderStars = (rating: number) => {
  const shouldShowRating = isReviewActuallyUnlocked || hasSubscription;
  
  return Array.from({ length: 5 }, (_, index) => (
    <Star
      key={index}
      className={`h-4 w-4 ${
        shouldShowRating && index < rating
          ? 'text-yellow-400 fill-current'
          : 'text-gray-300'
      }`}
    />
  ));
};
```

## Database Schema
- `credits` table: Stores user credit balances
- `credit_transactions` table: Tracks all credit-related transactions
- `update_user_credits` RPC function: Atomic credit updates

## Testing Scenarios
1. Credit purchase via Stripe (multiples of $3)
2. Credit usage for review unlocking
3. Transaction history accuracy
4. Star rating reveal on unlock
5. Subscription vs credit differentiation

## Important Notes
- Always use actual Stripe amounts in transaction display
- Local state updates provide immediate UI feedback
- Credit balance checks prevent overdraft
- Toast notifications confirm all actions
- Star ratings are revealed with review content
