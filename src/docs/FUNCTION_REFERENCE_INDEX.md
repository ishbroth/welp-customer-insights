
# Function Reference Index

## Overview
Master index of all app functions with links to detailed documentation.

## Core Systems

### 🔄 Loading & Navigation
- [Loading Screen Animation](./LOADING_SCREEN_REFERENCE.md) - Asterisk animation with clockwise blue highlighting
- [Navigation System](./NAVIGATION_REFERENCE.md) - React Router configuration and route protection

### 🔐 Authentication
- [Authentication System](./AUTHENTICATION_REFERENCE.md) - Login, signup, session management
- [Phone Verification](./PHONE_VERIFICATION_REFERENCE.md) - SMS-based phone verification
- [Profile Management](./PROFILE_MANAGEMENT_REFERENCE.md) - User profile editing and validation

### 🚫 Security & Validation
- [Duplicate Prevention](./DUPLICATE_PREVENTION_REFERENCE.md) - Prevent duplicate accounts
- [Form Validation](./FORM_VALIDATION_REFERENCE.md) - Form validation patterns
- [Input Sanitization](./INPUT_SANITIZATION_REFERENCE.md) - Security input handling

### 📱 User Interface
- [Component Library](./COMPONENT_REFERENCE.md) - Reusable UI components
- [Form Components](./FORM_COMPONENTS_REFERENCE.md) - Form-specific components
- [Animation System](./ANIMATION_REFERENCE.md) - CSS animations and transitions

### 🔍 Business Features
- [Review System](./REVIEW_SYSTEM_REFERENCE.md) - Customer reviews and ratings
- [Search Functionality](./SEARCH_REFERENCE.md) - Search and filtering
- [Business Verification](./BUSINESS_VERIFICATION_REFERENCE.md) - License verification

### 💳 Payment & Billing
- [Payment Processing](./PAYMENT_REFERENCE.md) - Stripe integration
- [Subscription Management](./SUBSCRIPTION_REFERENCE.md) - Billing and subscriptions
- [One-time Purchases](./ONE_TIME_PURCHASE_REFERENCE.md) - Single review purchases

## Critical Functions Quick Reference

### Loading Screen (MOST IMPORTANT)
```jsx
// Correct implementation in LoadingScreen.tsx
<svg width="200" height="200" viewBox="0 0 200 200">
  <g transform="translate(100, 100) rotate(12)">
    {/* Asterisk arms with clockwise blue highlighting */}
  </g>
</svg>
```

### Authentication
```typescript
const { currentUser, login, logout, signup } = useAuth();
```

### Navigation
```typescript
const navigate = useNavigate();
navigate('/profile');
```

### Phone Verification
```typescript
const { handleVerifyCode, handleResendCode } = usePhoneVerification();
```

## Emergency Recovery

### If Loading Screen Breaks
1. Check [Loading Screen Reference](./LOADING_SCREEN_REFERENCE.md)
2. Restore asterisk animation with 200x200 size
3. Ensure clockwise blue highlighting
4. Verify 12-degree tilt matches app icon

### If Auth Breaks
1. Check [Authentication Reference](./AUTHENTICATION_REFERENCE.md)
2. Verify auth state listener setup
3. Check session persistence
4. Ensure profile initialization

### If Navigation Breaks
1. Check [Navigation Reference](./NAVIGATION_REFERENCE.md)
2. Verify route protection
3. Check LoadingRoute integration
4. Ensure proper redirects

## Maintenance Notes
- Update references when functions change
- Test critical paths after updates
- Keep documentation in sync with code
- Review regularly for accuracy
