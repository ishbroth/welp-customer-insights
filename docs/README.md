
# Welp App Documentation

This directory contains comprehensive documentation for all major functions and features of the Welp application. Each document provides detailed information about implementation, dependencies, and important considerations.

## Documentation Structure

### Core Authentication & Registration
- [User Registration Flow](./registration-flow.md) - Complete user signup process including business/customer paths
- [Phone Verification System](./phone-verification.md) - SMS verification implementation using AWS SNS/Twilio
- [Authentication System](./authentication.md) - Login/logout, session management, and auth context

### Business Verification & Licensing
- [License Verification System](./license-verification.md) - Real-time license verification with state databases
- [Verification Badges](./verification-badges.md) - Verified business badge system and display logic
- [Manual Verification Process](./manual-verification.md) - Fallback verification for failed automatic checks

### Profile Management
- [Profile System](./profile-management.md) - User profile creation, editing, and data management
- [Business Profile Features](./business-profiles.md) - Business-specific profile functionality

### Review System
- [Review Creation & Management](./review-management.md) - Complete review CRUD operations
- [Customer Claiming System](./customer-claiming.md) - Customer claim/response functionality
- [Review Photos & Media](./review-media.md) - Photo upload and management system

### Access Control & Security
- [Duplicate Account Prevention](./duplicate-prevention.md) - Email/phone duplicate checking system
- [Guest Access System](./guest-access.md) - One-time review access for non-users
- [Credit System](./credit-system.md) - Credit-based access control and payments

### Payment & Subscription
- [Stripe Integration](./stripe-integration.md) - Payment processing and subscription management
- [Subscription Management](./subscription-system.md) - User subscription handling and access control

### Communication & Notifications
- [Notification System](./notification-system.md) - Push notifications, email, and user preferences
- [Email Communication](./email-system.md) - Automated email sending via Resend

### Data Management
- [Database Schema](./database-schema.md) - Complete database structure and relationships
- [Edge Functions](./edge-functions.md) - All Supabase edge functions and their purposes
- [File Storage](./file-storage.md) - Photo storage and management in Supabase

## Quick Reference

### Key Files by Function
- **Registration**: `src/pages/Signup.tsx`, `src/components/signup/`
- **Verification**: `src/pages/VerifyLicense.tsx`, `src/components/verification/`
- **Reviews**: `src/pages/CreateReview.tsx`, `src/components/reviews/`
- **Profiles**: `src/pages/Profile.tsx`, `src/components/profile/`
- **Authentication**: `src/contexts/auth/`
- **Edge Functions**: `supabase/functions/`

### Important Hooks
- `useAuth()` - Authentication state and methods
- `useBusinessVerification()` - License verification logic
- `useCredits()` - Credit system management
- `usePhoneVerification()` - SMS verification handling

### Database Tables
- `profiles` - User profile data
- `business_info` - Business-specific information
- `reviews` - Review content and metadata
- `verification_codes` - SMS verification codes
- `credits` - User credit balances
- `guest_access` - One-time access tokens

## Usage Guidelines

1. **Before Making Changes**: Always consult the relevant documentation first
2. **After Making Changes**: Update the documentation to reflect modifications
3. **Testing**: Refer to the testing scenarios in each document
4. **Troubleshooting**: Each document includes common issues and solutions

## Maintenance

Keep this documentation updated whenever:
- New features are added
- Existing functionality is modified
- Dependencies are changed
- New edge functions are created
- Database schema is updated
