
# Navigation System Reference

## Overview
React Router based navigation with route protection and loading transitions.

## Core Components
- **AppRoutes**: Main routing configuration
- **PrivateRoute**: Protected route wrapper
- **BusinessOrAdminRoute**: Business-specific route protection
- **LoadingRoute**: Page transition loading

## Route Structure
```
/ - Index (public)
/login - Login page (public)
/signup - Signup page (public)
/verify-email - Email verification (public)
/customer-benefits - Customer benefits (public)
/search - Search results (public)
/profile - User profile (private)
/profile/edit - Edit profile (private)
/profile/reviews - User reviews (private)
/profile/business-reviews - Business reviews (private)
/profile/billing - Billing page (private)
/notifications - Notifications (private)
```

## Route Protection
- **PrivateRoute**: Requires authentication
- **BusinessOrAdminRoute**: Requires business or admin account
- **LoadingRoute**: Adds page transition loading

## Common Issues & Solutions

### Issue 1: Protected Routes Accessible Without Auth
**Symptoms**: Can access /profile without login
**Cause**: Route protection not properly implemented
**Solution**: Ensure PrivateRoute wraps protected components

### Issue 2: Navigation Not Triggering Loading
**Symptoms**: Page transitions don't show loading screen
**Cause**: LoadingRoute not detecting route changes
**Solution**: Check location tracking in LoadingRoute

### Issue 3: Wrong Route Protection Level
**Symptoms**: Customers can access business routes
**Cause**: Using PrivateRoute instead of BusinessOrAdminRoute
**Solution**: Use correct route protection wrapper

## Testing Checklist
- [ ] Public routes accessible without auth
- [ ] Private routes redirect to login when not authenticated
- [ ] Business routes restricted to business/admin accounts
- [ ] Page transitions show loading animation
- [ ] Navigation works correctly across all routes
