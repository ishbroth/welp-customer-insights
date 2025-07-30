# Credit System - Current State Snapshot
*Date: 2025-01-30*

## Overview
Credit-based access control system with Stripe payments, persistent review access, and comprehensive transaction tracking.

## Core Components Status

### Credits Hook (`src/hooks/useCredits.ts`)
- **Status**: Fully implemented and working
- **Return Values**:
  - `balance`: Current user credit balance
  - `transactions`: Transaction history
  - `isLoading`: Loading state
  - `loadCreditsData`: Refresh credit data
  - `processSuccessfulPurchase`: Handle Stripe success
  - `useCredits`: Consume credits function

### Credits Page (`src/pages/Credits.tsx`)
- **Status**: Fully implemented and working
- **Features**:
  - Credit balance display
  - Purchase options
  - Transaction history
  - Stripe integration

### Database Schema

#### Credits Table
```sql
CREATE TABLE credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  balance INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### Credit Transactions Table
```sql
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL, -- 'purchase', 'usage', 'refund'
  description TEXT,
  stripe_session_id TEXT,
  review_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### Guest Access Table
```sql
CREATE TABLE guest_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Database Functions

#### update_user_credits
```sql
CREATE OR REPLACE FUNCTION update_user_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_stripe_session_id TEXT DEFAULT NULL
) RETURNS void
```
- **Purpose**: Atomic credit balance updates
- **Features**: Transaction logging, balance management
- **Status**: Working correctly

### Credit Purchase Flow

#### Stripe Integration
1. User selects credit package
2. Stripe checkout session created
3. Payment processed by Stripe
4. Webhook updates credit balance
5. Success page confirmation
6. Credits available immediately

#### Package Options
- **Basic**: 10 credits for $9.99
- **Standard**: 25 credits for $19.99
- **Premium**: 50 credits for $39.99
- **Custom**: Enterprise packages available

### Credit Usage System

#### Review Access Control
- **Cost**: 1 credit per review unlock
- **Persistence**: Once unlocked, access is permanent
- **Integration**: Seamlessly integrated with review display
- **Validation**: Credit balance checked before usage

#### Usage Tracking
- **Transaction Logging**: Every credit usage logged
- **Audit Trail**: Complete history maintained
- **Analytics**: Usage patterns tracked
- **Reporting**: Detailed usage reports

### Persistent Access System

#### Review Unlocking
```typescript
const useReviewAccess = () => {
  const isReviewUnlocked = (reviewId: string): boolean;
  const addUnlockedReview = (reviewId: string): Promise<void>;
  const refreshAccess = (): Promise<void>;
}
```

#### Access Persistence
- **Database Storage**: Unlocked reviews stored in credit_transactions
- **Query Optimization**: Efficient access checking
- **Cache Management**: Local caching for performance
- **Sync**: Real-time synchronization

### Transaction Management

#### Transaction Types
- **Purchase**: Credit purchases via Stripe
- **Usage**: Credit consumption for features
- **Refund**: Credit refunds and adjustments
- **Bonus**: Promotional credits

#### Transaction History
- **Display**: Comprehensive transaction display
- **Filtering**: Filter by type, date, amount
- **Export**: Export transaction history
- **Search**: Search transaction descriptions

### Stripe Integration

#### Webhook Handler
- **Events**: payment_intent.succeeded, checkout.session.completed
- **Processing**: Automatic credit allocation
- **Verification**: Webhook signature verification
- **Idempotency**: Duplicate payment prevention

#### Payment Security
- **PCI Compliance**: Stripe handles all card data
- **Secure Transmission**: HTTPS encryption
- **Webhook Security**: Signature verification
- **Fraud Prevention**: Stripe's fraud protection

### Guest Access System

#### Session Management
- **Anonymous Users**: Support for non-authenticated users
- **Session Tracking**: Browser session identification
- **Resource Access**: Temporary access to specific resources
- **Conversion**: Easy conversion to full accounts

#### Access Control
- **Time-Limited**: Guest access expires after session
- **Resource-Specific**: Access limited to purchased resources
- **Upgrade Path**: Clear path to full account creation
- **Data Privacy**: Guest data properly managed

### UI Components

#### Credit Balance Display
- **Real-Time**: Current balance always up to date
- **Visual**: Clear, prominent display
- **Responsive**: Mobile-friendly design
- **Actions**: Quick access to purchase options

#### Transaction History Card
- **Categorization**: Transactions properly categorized
- **Stripe Amounts**: Accurate Stripe charge amounts displayed
- **Descriptions**: Clear transaction descriptions
- **Timestamps**: Proper date/time formatting

#### Credit Purchase Interface
- **Package Selection**: Clear package options
- **Pricing**: Transparent pricing display
- **Checkout**: Seamless Stripe checkout
- **Confirmation**: Clear purchase confirmation

### Enhanced Customer Review Card Integration

#### Credit Usage Flow
```typescript
const handleUseCreditClick = async (reviewId: string) => {
  // Check credit balance
  if (balance < 1) {
    // Redirect to purchase page
    return;
  }
  
  // Use credit and unlock review
  await useCredits(1, `Unlock review ${reviewId}`);
  await addUnlockedReview(reviewId);
  
  // Update UI immediately
  setShowFullReview(true);
}
```

#### Star Rating Display
- **Conditional Rendering**: Based on unlock status or subscription
- **Visual Feedback**: Clear indication of access level
- **Upgrade Prompts**: Encourage credit purchase when needed
- **Seamless Experience**: Smooth transition between states

### Security & Privacy

#### Access Control
- **User Isolation**: Credits isolated per user
- **RLS Policies**: Comprehensive row-level security
- **API Security**: Secure API endpoints
- **Data Validation**: Input validation and sanitization

#### Audit Trail
- **Complete Logging**: All credit activities logged
- **Tamper Prevention**: Immutable transaction records
- **Compliance**: Audit-ready transaction history
- **Monitoring**: Real-time monitoring of credit activities

### Performance Optimizations

#### Database Performance
- **Indexing**: Optimized indexes on key columns
- **Query Optimization**: Efficient query patterns
- **Connection Pooling**: Database connection management
- **Caching**: Strategic caching of frequently accessed data

#### Client Performance
- **Lazy Loading**: Load transaction history on demand
- **Memoization**: Cache expensive calculations
- **Debouncing**: Optimize user interactions
- **Background Updates**: Non-blocking updates

### Testing Status
- ✅ Credit purchase flow complete
- ✅ Credit usage functionality
- ✅ Transaction history accuracy
- ✅ Persistent review access
- ✅ Stripe webhook processing
- ✅ Guest access system
- ✅ UI responsiveness
- ✅ Security measures

### Monitoring & Analytics

#### Key Metrics
- **Purchase Conversion**: Credit purchase rates
- **Usage Patterns**: How credits are consumed
- **Revenue Tracking**: Revenue from credit sales
- **User Engagement**: Credit system engagement

#### Error Monitoring
- **Payment Failures**: Stripe payment failure tracking
- **System Errors**: Credit system error monitoring
- **Performance**: Response time monitoring
- **Availability**: System uptime tracking

### Recent Changes
- No recent changes to credit system
- All functionality stable and working correctly

### Dependencies
- **Stripe**: Payment processing
- **Supabase**: Database and edge functions
- **React Query**: Data fetching and caching
- **Zod**: Data validation

This credit system is production-ready and handling all credit-related functionality correctly.