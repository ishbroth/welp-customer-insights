
# User Registration Flow Documentation

## Overview
Complete user registration system supporting both business and customer account types with phone verification and license validation.

## Core Components

### Main Files
- `src/pages/Signup.tsx` - Main signup page with tab switching
- `src/components/signup/BusinessSignupForm.tsx` - Business registration flow
- `src/components/signup/CustomerSignupForm.tsx` - Customer registration flow
- `src/hooks/useBusinessAccountCreation.ts` - Business account creation logic
- `src/hooks/useCustomerSignupState.ts` - Customer form state management

### Registration Flow

#### Business Registration
1. **Business Information Collection** (`BusinessVerificationStep.tsx`)
   - Business name, email, address details
   - License type selection (EIN, contractor license, etc.)
   - License number input
   - Phone number for verification

2. **Duplicate Account Check** (`useBusinessDuplicateCheck.ts`)
   - Real-time email/phone validation
   - Cross-reference with existing accounts
   - Blocks registration if duplicates found

3. **License Verification** (`useBusinessVerification.ts`)
   - Automatic license verification with state databases
   - Real-time validation using `verifyBusinessId()`
   - Fallback to manual verification if automatic fails

4. **Password Setup** (`PasswordSetupStep.tsx`)
   - Password creation and confirmation
   - Strength validation
   - Account creation trigger

5. **Phone Verification** (`src/pages/VerifyPhone.tsx`)
   - SMS code sending via AWS SNS
   - Code validation and account activation
   - Redirect to profile on success

#### Customer Registration
1. **Personal Information** (`CustomerPersonalInfoSection.tsx`)
   - First/last name, email, phone
   - Real-time duplicate checking

2. **Address Information** (`CustomerAddressSection.tsx`)
   - Street address, city, state, zip code
   - Google Maps integration for validation

3. **Password Setup** (`CustomerPasswordSection.tsx`)
   - Password creation with confirmation
   - Immediate account creation and verification

### Key Features

#### Duplicate Prevention
- Edge function: `check-duplicates`
- Real-time validation during form input
- Prevents duplicate accounts by email/phone
- Shows dialog with options to sign in instead

#### License Verification
- Integration with state licensing databases
- Support for multiple license types
- Real-time verification results
- Verified badge assignment for successful verification

#### SMS Verification
- AWS SNS integration for production
- Twilio fallback support
- 6-digit code generation and validation
- Code expiration handling (10 minutes)

## Database Integration

### Tables Used
- `profiles` - Basic user information
- `business_info` - Business-specific data and verification status
- `verification_codes` - SMS verification codes
- `verification_requests` - Manual verification submissions

### Edge Functions
- `create-profile` - Profile creation with service role access
- `send-verification-code` - SMS code delivery
- `verify-phone-code` - Code validation and account activation
- `check-duplicates` - Duplicate account prevention

## State Management

### Form State
- Business: `useBusinessFormState()` - Centralized form data
- Customer: `useCustomerSignupState()` - Form state with validation
- Verification: Phone verification state in dedicated hook

### URL Parameters
- Account type selection (`?type=business|customer`)
- Unlock flow detection (`?unlock=review`)
- Phone verification data passing

## Error Handling

### Common Scenarios
1. **Duplicate Accounts**: Shows dialog with sign-in options
2. **License Verification Failure**: Continues with unverified account
3. **SMS Delivery Issues**: Resend functionality with rate limiting
4. **Network Errors**: User-friendly error messages
5. **Form Validation**: Real-time field validation

### Recovery Mechanisms
- Account creation continues even if verification fails
- Manual verification option for license issues
- Email confirmation bypass for development
- Retry mechanisms for SMS sending

## Testing Considerations

### Business Registration Testing
1. Test with valid/invalid license numbers
2. Verify duplicate prevention works correctly
3. Check SMS delivery and code validation
4. Confirm verified badge assignment

### Customer Registration Testing
1. Test form validation and error handling
2. Verify address autocomplete functionality
3. Check duplicate prevention
4. Confirm immediate account activation

## Dependencies
- Supabase Auth for account creation
- AWS SNS/Twilio for SMS delivery
- Google Maps API for address validation
- Real license verification services
- Stripe for payment processing (business accounts)

## Future Enhancements
- Social login integration
- Bulk business registration
- Enhanced license type support
- International phone number support
- Two-factor authentication options
