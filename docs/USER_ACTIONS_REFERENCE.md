
# User Actions Reference Guide

This document provides a comprehensive overview of all major user actions in the Welp application, their code paths, and potential error points for debugging purposes.

## 1. ACCOUNT CREATION

### Customer Account Creation
**Entry Point:** `/signup?type=customer`
**Main Components:**
- `src/components/signup/CustomerSignupForm.tsx`
- `src/contexts/auth/hooks/useAuthSignup.ts`
- `supabase/functions/create-profile/index.ts`

**Flow:**
1. User fills out customer signup form
2. `useAuthSignup.signup()` called with user data
3. Supabase Auth creates user account
4. `create-profile` edge function creates profile record
5. Phone verification initiated via `verify-phone` function
6. Redirect to `/verify-phone` with user data in URL params

**Key Files to Check for Errors:**
- Form validation in `CustomerSignupForm.tsx`
- Auth signup logic in `useAuthSignup.ts`
- Profile creation in `create-profile/index.ts`
- Phone verification setup in `verify-phone/index.ts`

**Common Error Points:**
- Missing required fields
- Email already exists
- Profile creation failure
- Phone verification SMS sending failure

### Business Account Creation
**Entry Point:** `/signup?type=business`
**Main Components:**
- `src/components/signup/BusinessSignupForm.tsx`
- `src/hooks/useBusinessVerification.ts`
- `src/hooks/useBusinessAccountCreation.ts`
- `supabase/functions/verify-business/index.ts`

**Flow:**
1. Business information form (Step 1)
2. Business verification attempt via `verify-business` function
3. If verification fails, phone verification fallback
4. Password setup (Step 2)
5. Account creation with phone verification
6. Redirect to verification success page

**Key Files to Check for Errors:**
- Business verification logic in `verify-business/index.ts`
- Form state management in `useBusinessFormState.ts`
- Account creation in `useBusinessAccountCreation.ts`
- Phone verification flow in `PhoneVerificationFlow.tsx`

**Common Error Points:**
- Business license verification failure
- Duplicate business detection
- Phone verification SMS failure
- Profile creation errors

## 2. PHONE VERIFICATION

### Phone Verification Process
**Entry Points:** 
- From signup: `/verify-phone?email=...&password=...&phone=...`
- From login redirect for unverified users

**Main Components:**
- `src/pages/VerifyPhone.tsx`
- `src/hooks/usePhoneVerification.ts`
- `src/hooks/usePhoneVerificationActions.ts`
- `supabase/functions/verify-phone/index.ts`

**Flow:**
1. SMS code sent via Twilio integration
2. User enters 6-digit verification code
3. Code verified against database
4. User account created/updated with verified status
5. Redirect to login or dashboard

**Key Files to Check for Errors:**
- SMS sending logic in `verify-phone/index.ts`
- Code verification in `usePhoneVerificationActions.ts`
- Twilio integration and credentials
- Database verification_codes table operations

**Common Error Points:**
- Twilio configuration issues
- SMS delivery failures
- Expired or invalid codes
- Database verification code cleanup
- Account creation after verification

## 3. USER LOGIN

### Login Process
**Entry Point:** `/login`
**Main Components:**
- `src/pages/Login.tsx`
- `src/contexts/auth/hooks/useAuthLogin.ts`
- `src/contexts/auth/useAuthState.ts`

**Flow:**
1. Email/password submission
2. Supabase Auth authentication
3. Profile verification status check
4. Conditional redirect based on verification status
5. Session and user state management

**Key Files to Check for Errors:**
- Authentication logic in `useAuthLogin.ts`
- Profile status checking
- Redirect logic for unverified users
- Session state management in `useAuthState.ts`

**Common Error Points:**
- Invalid credentials
- Unconfirmed email addresses
- Incomplete phone verification
- Profile data inconsistencies
- Redirect loop issues

## 4. REVIEW SUBMISSION

### Review Creation Process
**Entry Points:**
- `/review/new` (direct)
- Customer search results → review form

**Main Components:**
- Review form components (various)
- Review submission hooks
- Database reviews table

**Flow:**
1. Customer information entry/search
2. Review content and rating input
3. Optional photo uploads
4. Review submission to database
5. Business notification (if enabled)

**Key Files to Check for Errors:**
- Review form validation
- Customer matching logic
- Photo upload handling
- Database insert operations
- Notification system

**Common Error Points:**
- Customer data validation
- File upload failures
- Database constraint violations
- Notification delivery issues

## 5. REVIEW CLAIMING

### Review Claim Process
**Entry Point:** Customer dashboard with unclaimed reviews
**Main Components:**
- `src/components/customer/EnhancedCustomerReviewCard.tsx`
- `src/components/customer/ClaimReviewDialog.tsx`
- Review claiming hooks

**Flow:**
1. Customer finds matching review
2. Claim dialog with confirmation
3. Review linked to customer account
4. Claim history recorded
5. UI updates to reflect claimed status

**Key Files to Check for Errors:**
- Review matching algorithms
- Claim confirmation logic
- Database update operations
- UI state management after claiming

**Common Error Points:**
- False positive matches
- Claim authorization failures
- Database constraint violations
- UI state inconsistencies

## 6. RESPONSE SUBMISSION

### Response Creation Process
**Entry Point:** Review cards with response functionality
**Main Components:**
- Response submission components
- Response management hooks
- Database responses table

**Flow:**
1. Response form display on eligible reviews
2. Content input and validation
3. Response submission to database
4. Real-time UI updates
5. Notification to relevant parties

**Key Files to Check for Errors:**
- Response authorization logic
- Content validation
- Database operations
- Real-time update mechanisms

**Common Error Points:**
- Authorization failures
- Content validation errors
- Database insert failures
- Notification delivery issues

## 7. SUBSCRIPTION MANAGEMENT

### Subscription Process
**Entry Points:**
- `/subscription` (main page)
- Payment flow triggers

**Main Components:**
- Subscription management components
- Stripe integration
- Database subscriptions table

**Flow:**
1. Subscription plan selection
2. Stripe payment processing
3. Subscription record creation
4. Access level updates
5. Feature unlocking

**Key Files to Check for Errors:**
- Stripe integration code
- Payment webhook handling
- Subscription status management
- Access control logic

**Common Error Points:**
- Payment processing failures
- Webhook verification issues
- Subscription status sync problems
- Access control bugs

## 8. ONE-TIME ACCESS PURCHASE

### Guest Access Process
**Entry Point:** Review access purchase flows
**Main Components:**
- Payment processing components
- Guest access management
- Database guest_access table

**Flow:**
1. Review access request
2. Payment processing via Stripe
3. Temporary access token creation
4. Access validation and enforcement
5. Expiration handling

**Key Files to Check for Errors:**
- Payment processing logic
- Access token generation
- Token validation mechanisms
- Expiration cleanup processes

**Common Error Points:**
- Payment failures
- Token generation issues
- Access validation bugs
- Cleanup process failures

## 9. BUSINESS VERIFICATION

### Business Verification Process
**Entry Point:** Business signup verification step
**Main Components:**
- `supabase/functions/verify-business/index.ts`
- Business verification components
- External API integrations

**Flow:**
1. Business information submission
2. External verification API calls
3. Verification result processing
4. Fallback to phone verification if needed
5. Account status updates

**Key Files to Check for Errors:**
- External API integration code
- Verification result processing
- Fallback mechanism logic
- Account status management

**Common Error Points:**
- API integration failures
- Verification data mismatches
- Fallback logic issues
- Status update failures

## 10. PROFILE MANAGEMENT

### Profile Update Process
**Entry Points:**
- `/profile` (user profile page)
- Settings and preferences pages

**Main Components:**
- Profile management components
- Profile update hooks
- Database profiles table

**Flow:**
1. Profile information display
2. Edit form interactions
3. Data validation and submission
4. Database updates
5. UI refresh with new data

**Key Files to Check for Errors:**
- Profile update logic
- Data validation rules
- Database update operations
- UI state synchronization

**Common Error Points:**
- Validation rule violations
- Database update failures
- State synchronization issues
- Permission boundary problems

## DEBUGGING CHECKLIST

When investigating issues, check these common areas:

### Authentication Issues
- [ ] Supabase Auth configuration
- [ ] Email confirmation settings
- [ ] Session persistence
- [ ] Token refresh mechanisms

### Database Issues
- [ ] RLS policy conflicts
- [ ] Foreign key constraints
- [ ] Data type mismatches
- [ ] Null value handling

### API Integration Issues
- [ ] External service credentials
- [ ] API rate limiting
- [ ] Error response handling
- [ ] Timeout configurations

### UI State Issues
- [ ] Component state management
- [ ] Props drilling problems
- [ ] Event handler binding
- [ ] Conditional rendering logic

### Performance Issues
- [ ] Database query optimization
- [ ] Component re-render cycles
- [ ] Memory leak patterns
- [ ] Bundle size optimization

## ERROR LOGGING LOCATIONS

Key places to add console.log statements for debugging:

1. **Authentication flows:** Before and after auth operations
2. **Database operations:** Query parameters and results
3. **API calls:** Request/response data
4. **State changes:** Before/after state updates
5. **Conditional logic:** Branch execution paths
6. **Error boundaries:** Caught exception details
7. **Async operations:** Promise resolution/rejection
8. **Event handlers:** User interaction events

Remember to remove debug logging before production deployment.
