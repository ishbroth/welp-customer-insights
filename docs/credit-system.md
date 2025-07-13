
# Credit System Documentation

## Overview
Comprehensive credit-based access control system that allows users to purchase credits for one-time review access, guest access tokens, and premium features.

## Core Components

### Main Files
- `src/hooks/useCredits.ts` - Credit management hook
- `src/pages/Credits.tsx` - Credit purchase and management page
- `src/components/credits/` - Credit-related UI components
- `supabase/functions/create-payment/` - Stripe payment processing
- `supabase/functions/process-credit-purchase/` - Credit allocation

### Database Schema

#### credits Table
```sql
- id: uuid (primary key)
- user_id: uuid (references profiles.id)
- balance: integer (current credit balance)
- created_at: timestamp
- updated_at: timestamp
```

#### credit_transactions Table
```sql
- id: uuid (primary key)
- user_id: uuid (references profiles.id)
- type: text (purchase, usage, refund, bonus)
- amount: integer (credit amount, positive or negative)
- description: text (transaction description)
- stripe_session_id: text (payment reference)
- created_at: timestamp
```

#### guest_access Table
```sql
- id: uuid (primary key)
- review_id: uuid (references reviews.id)
- access_token: text (unique access token)
- stripe_session_id: text (payment reference)
- created_at: timestamp
- expires_at: timestamp (24-hour expiration)
```

### Credit Purchase System

#### Payment Integration
- Stripe Checkout integration
- Multiple credit package options
- Secure payment processing
- Automatic credit allocation

#### Package Options
- 1 Credit: $2.99 (single review access)
- 5 Credits: $12.99 (bulk discount)
- 10 Credits: $19.99 (best value)
- Custom packages for enterprise users

#### Purchase Flow
1. User selects credit package
2. Stripe Checkout session creation
3. Payment processing
4. Credit balance update
5. Transaction record creation
6. Purchase confirmation

### Guest Access System

#### One-Time Access Tokens
- Credit-based guest access creation
- Unique token generation
- Time-limited access (24 hours)
- Review-specific access control

#### Guest Purchase Flow
1. Non-user wants to access review
2. Payment for single access
3. Token generation and delivery
4. Temporary review access
5. Token expiration cleanup

### Credit Usage Tracking

#### Usage Types
- Review access (1 credit per access)
- Premium features (variable costs)
- Guest token generation (1 credit)
- Subscription upgrades (credit offset)

#### Transaction Recording
- Detailed transaction logging
- Usage pattern analytics
- Refund and adjustment tracking
- Audit trail maintenance

### Credit Management Hook

#### useCredits() Features
```typescript
const {
  balance,           // Current credit balance
  transactions,      // Transaction history
  isLoading,         // Loading state
  loadCreditsData,   // Refresh credit data
  processSuccessfulPurchase, // Handle purchase
  useCredits         // Consume credits
} = useCredits();
```

#### Credit Operations
- Balance checking
- Credit consumption
- Purchase processing
- Transaction history
- Error handling

### Payment Processing

#### Stripe Integration
- Secure checkout sessions
- Payment verification
- Webhook handling (optional)
- Refund processing

#### Edge Functions
- `create-payment`: Stripe session creation
- `verify-payment`: Payment confirmation
- `process-refund`: Refund handling
- `cleanup-expired-tokens`: Token maintenance

### Database Functions

#### update_user_credits Function
```sql
CREATE OR REPLACE FUNCTION update_user_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_stripe_session_id TEXT DEFAULT NULL
)
```

#### Credit Balance Management
- Atomic credit updates
- Transaction consistency
- Balance validation
- Concurrent update handling

### Access Control

#### Credit Verification
- Sufficient balance checking
- Usage authorization
- Feature access gating
- Premium content unlocking

#### Security Measures
- Credit tampering prevention
- Unauthorized usage blocking
- Payment verification
- Fraud detection

### User Interface

#### Credit Dashboard
- Current balance display
- Transaction history
- Purchase options
- Usage analytics

#### Purchase Interface
- Package selection
- Payment processing
- Success confirmation
- Error handling

### Notification System

#### Credit Notifications
- Low balance warnings
- Purchase confirmations
- Usage notifications
- Expiration alerts

#### Email Integration
- Purchase receipts
- Balance notifications
- Usage summaries
- Promotional offers

## Performance Optimization

### Database Performance
- Indexed credit queries
- Efficient balance calculations
- Transaction batch processing
- Cleanup job scheduling

### Caching Strategy
- Balance caching
- Transaction caching
- Payment status caching
- User session caching

### Rate Limiting
- Purchase attempt limiting
- Credit usage rate limits
- API call throttling
- Abuse prevention

## Testing Scenarios

### Credit Purchase Testing
1. **Payment Flow Testing**
   - Stripe integration testing
   - Payment success scenarios
   - Payment failure handling
   - Credit allocation verification

2. **Credit Usage Testing**
   - Sufficient balance scenarios
   - Insufficient balance handling
   - Concurrent usage testing
   - Transaction consistency

3. **Guest Access Testing**
   - Token generation
   - Access verification
   - Expiration handling
   - Security validation

## Security Considerations

### Payment Security
- Stripe PCI compliance
- Secure API communications
- Payment verification
- Fraud prevention

### Credit Security
- Balance tampering prevention
- Unauthorized access blocking
- Transaction integrity
- Audit trail maintenance

### Data Protection
- User financial data protection
- Transaction encryption
- Access log security
- Privacy compliance

## Monitoring and Analytics

### Credit Metrics
- Purchase conversion rates
- Usage patterns
- Balance distribution
- Transaction volumes

### Financial Analytics
- Revenue tracking
- Package performance
- Refund rates
- Customer lifetime value

### System Health
- Payment success rates
- Credit allocation accuracy
- Database performance
- Error occurrence tracking

## Configuration Options

### Credit Packages
- Package pricing configuration
- Credit amounts per package
- Promotional pricing
- Regional pricing variations

### System Settings
- Credit expiration policies
- Usage rate limits
- Notification preferences
- Feature access levels

## Future Enhancements

### Planned Features
- Subscription credit bundles
- Referral credit bonuses
- Bulk enterprise packages
- Credit transfer capabilities

### Technical Improvements
- Real-time balance updates
- Advanced fraud detection
- Machine learning usage patterns
- Mobile payment integration

## Troubleshooting Guide

### Common Issues
1. **Payment Processing Failures**
   - Stripe configuration verification
   - Payment method validation
   - Network connectivity check
   - Error log analysis

2. **Credit Balance Discrepancies**
   - Transaction log review
   - Database consistency check
   - Concurrent update analysis
   - Manual balance correction

3. **Guest Access Problems**
   - Token generation verification
   - Expiration time validation
   - Access permission check
   - Security token verification

## API Documentation

### Credit Management Endpoints
```typescript
// Get user credit balance
const { data: credits } = await supabase
  .from('credits')
  .select('balance')
  .eq('user_id', userId)
  .single();

// Create credit transaction
const { error } = await supabase.rpc('update_user_credits', {
  p_user_id: userId,
  p_amount: creditAmount,
  p_type: 'purchase',
  p_description: 'Credit purchase'
});
```

### Payment Processing
```typescript
// Create payment session
const { data } = await supabase.functions.invoke('create-payment', {
  body: {
    creditPackage: 'standard_5',
    successUrl: window.location.origin + '/credits/success',
    cancelUrl: window.location.origin + '/credits'
  }
});
```
