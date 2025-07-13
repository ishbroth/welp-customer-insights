
# Subscription Management System Documentation

## Overview
Comprehensive subscription system for managing user access levels, payment processing, and feature gating with Stripe integration.

## Core Components

### Main Files
- `src/pages/Subscription.tsx` - Subscription management interface
- `src/hooks/useSubscription.ts` - Subscription state management
- `src/components/subscription/` - Subscription UI components
- `supabase/functions/create-subscription/` - Stripe subscription creation
- `supabase/functions/manage-subscription/` - Subscription management

### Database Schema

#### subscriptions Table
```sql
- id: uuid (primary key)
- user_id: uuid (references profiles.id)
- type: text (basic, premium, enterprise)
- status: text (active, inactive, cancelled, past_due)
- started_at: timestamp
- expires_at: timestamp
- created_at: timestamp
- updated_at: timestamp
```

#### subscription_features Table
```sql
- id: uuid (primary key)
- subscription_type: text
- feature_name: text
- feature_limit: integer
- is_enabled: boolean
```

### Subscription Tiers

#### Basic Plan (Free)
- Limited review access
- Basic profile features
- Standard support
- Advertisement supported

#### Premium Plan ($9.99/month)
- Unlimited review access
- Advanced profile features
- Priority support
- Ad-free experience
- Advanced analytics

#### Enterprise Plan ($29.99/month)
- All premium features
- Bulk operations
- API access
- Custom integrations
- Dedicated support

### Subscription Management

#### Subscription Creation
- Plan selection interface
- Stripe checkout integration
- Payment processing
- Account upgrade
- Feature activation

#### Subscription Updates
- Plan upgrades/downgrades
- Payment method updates
- Billing cycle changes
- Feature modifications

#### Subscription Cancellation
- Cancellation flow
- End-of-cycle termination
- Data retention policies
- Resubscription options

### Payment Processing

#### Stripe Integration
- Secure payment processing
- Recurring billing management
- Invoice generation
- Payment failure handling

#### Webhook Handling
- Subscription status updates
- Payment confirmations
- Cancellation processing
- Upgrade/downgrade events

### Feature Gating

#### Access Control
- Subscription-based feature access
- Usage limit enforcement
- Feature availability checking
- Graceful degradation

#### Feature Implementation
```typescript
const useFeatureAccess = (featureName: string) => {
  const { subscription } = useAuth();
  
  const hasAccess = useMemo(() => {
    if (!subscription) return false;
    return checkFeatureAccess(subscription.type, featureName);
  }, [subscription, featureName]);
  
  return hasAccess;
};
```

### Billing Management

#### Invoice Generation
- Automated invoice creation
- Tax calculation
- Payment receipt generation
- Billing history

#### Payment Methods
- Credit card processing
- Payment method storage
- Automatic payment retries
- Payment failure notifications

### User Interface

#### Subscription Dashboard
- Current plan display
- Usage statistics
- Billing information
- Plan comparison

#### Upgrade Interface
- Plan feature comparison
- Pricing display
- Upgrade flow
- Payment processing

### Notification System

#### Billing Notifications
- Payment confirmations
- Payment failures
- Subscription renewals
- Cancellation notices

#### Feature Notifications
- Usage limit warnings
- Feature unlock notifications
- Plan recommendation alerts
- Upgrade suggestions

## Implementation Details

### Subscription Hook
```typescript
export const useSubscription = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  
  const updateSubscription = async (planType: string) => {
    // Stripe subscription update logic
  };
  
  const cancelSubscription = async () => {
    // Subscription cancellation logic
  };
  
  return {
    subscription,
    loading,
    updateSubscription,
    cancelSubscription
  };
};
```

### Feature Access Control
```typescript
const FeatureGate = ({ 
  feature, 
  children, 
  fallback 
}: FeatureGateProps) => {
  const hasAccess = useFeatureAccess(feature);
  
  if (!hasAccess) {
    return fallback || <UpgradePrompt feature={feature} />;
  }
  
  return <>{children}</>;
};
```

### Stripe Webhook Handler
```typescript
// Edge function for webhook processing
export const handleStripeWebhook = async (req: Request) => {
  const sig = req.headers.get('stripe-signature');
  const body = await req.text();
  
  const event = stripe.webhooks.constructEvent(
    body,
    sig,
    webhookSecret
  );
  
  switch (event.type) {
    case 'customer.subscription.updated':
      await updateSubscriptionStatus(event.data.object);
      break;
    case 'invoice.payment_failed':
      await handlePaymentFailure(event.data.object);
      break;
  }
};
```

## Testing Scenarios

### Subscription Testing
1. **Plan Upgrade Testing**
   - Upgrade flow completion
   - Feature activation
   - Billing calculation
   - Payment processing

2. **Payment Failure Testing**
   - Failed payment handling
   - Retry mechanisms
   - Account downgrade
   - User notifications

3. **Cancellation Testing**
   - Cancellation flow
   - Feature deactivation
   - Data retention
   - Resubscription options

## Security Considerations

### Payment Security
- PCI DSS compliance
- Secure payment processing
- Webhook signature verification
- Payment data encryption

### Access Control
- Feature access validation
- Subscription status verification
- Unauthorized access prevention
- User permission enforcement

## Performance Optimization

### Subscription Checks
- Cached subscription status
- Efficient database queries
- Optimized feature checks
- Minimal API calls

### Payment Processing
- Asynchronous webhook handling
- Batch payment processing
- Optimized Stripe calls
- Error recovery mechanisms

## Monitoring and Analytics

### Subscription Metrics
- Subscription conversion rates
- Churn analysis
- Revenue tracking
- Plan popularity

### Usage Analytics
- Feature utilization
- User engagement
- Usage patterns
- Upgrade triggers

## Configuration Options

### Plan Configuration
- Pricing tiers
- Feature sets
- Billing cycles
- Trial periods

### Payment Settings
- Accepted payment methods
- Currency options
- Tax calculations
- Discount codes

## Future Enhancements

### Planned Features
- Annual billing discounts
- Team/organization plans
- Usage-based billing
- Custom enterprise solutions

### Technical Improvements
- Advanced analytics
- Automated marketing
- A/B testing for pricing
- Mobile payment optimization

## Troubleshooting Guide

### Common Issues
1. **Payment Processing Failures**
   - Stripe configuration check
   - Payment method validation
   - Network connectivity
   - Error log analysis

2. **Feature Access Problems**
   - Subscription status verification
   - Cache invalidation
   - Permission updates
   - Database synchronization

3. **Webhook Processing Issues**
   - Webhook endpoint verification
   - Signature validation
   - Event processing logs
   - Retry mechanism check

## API Documentation

### Subscription Management
```typescript
// Create subscription
const { data } = await supabase.functions.invoke('create-subscription', {
  body: {
    planType: 'premium',
    paymentMethodId: 'pm_123456789'
  }
});

// Update subscription
const { data } = await supabase.functions.invoke('update-subscription', {
  body: {
    subscriptionId: 'sub_123456789',
    newPlan: 'enterprise'
  }
});
```

### Feature Access API
```typescript
// Check feature access
const hasAccess = await checkFeatureAccess(userId, 'advanced_analytics');

// Get subscription details
const { data: subscription } = await supabase
  .from('subscriptions')
  .select('*, subscription_features(*)')
  .eq('user_id', userId)
  .eq('status', 'active')
  .single();
```
