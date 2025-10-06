
# Account Deletion Feature Reference

## Overview
This document serves as a comprehensive reference for the self-service account deletion feature implemented in the application.

## Architecture

### Edge Function: `delete-account`
- **Location**: `supabase/functions/delete-account/index.ts`
- **Purpose**: Handles complete account deletion with comprehensive data cleanup
- **Security**: Requires authentication via JWT verification

### Frontend Components

#### Hook: `useAccountDeletion`
- **Location**: `src/hooks/useAccountDeletion.ts`
- **Purpose**: Manages deletion process, confirmations, and UI state
- **Features**: 
  - Multi-step confirmation process
  - Automatic logout and redirect after deletion
  - Loading states and error handling

#### Component: `DeleteAccountSection`
- **Location**: `src/components/profile/DeleteAccountSection.tsx`
- **Purpose**: UI component for account deletion within profile settings
- **Design**: Styled as "Danger Zone" with appropriate warnings

## Data Cleanup Process

The deletion process removes data from these tables:
1. `profiles` - User profile information
2. `business_info` - Business-specific data
3. `reviews` - All reviews (authored and received)
4. `review_claim_history` - Review claim records
5. `verification_codes` - Phone verification codes
6. `verification_requests` - Business verification requests
7. `customer_access` - Customer access records
8. `guest_access` - Guest access records
9. `responses` - Review responses
10. `review_photos` - Review photo attachments
11. `review_reports` - Review reports
12. `user_review_notifications` - Review notifications
13. `credit_transactions` - Credit transaction history
14. `credits` - User credit balances
15. `subscriptions` - Subscription records
16. `device_tokens` - Push notification tokens
17. `notification_preferences` - Notification settings
18. `notifications_log` - Notification history
19. `user_sessions` - Session records

## Security Features
- JWT authentication required
- Multiple confirmation steps
- Irreversible deletion warning
- Immediate session termination

## Integration Points
- Integrated into `ProfilePage.tsx`
- Uses Supabase auth for user management
- Leverages toast notifications for user feedback

## Future Enhancement Areas
- Add data export option before deletion
- Implement soft delete with grace period
- Add audit logging for compliance
- Enhanced confirmation process
- Batch deletion for large datasets
