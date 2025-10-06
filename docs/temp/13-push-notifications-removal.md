# Push Notifications Removal Plan

## Overview
Remove push notification infrastructure since we're using email notifications only.

## Current State
- `device_tokens` table exists in database
- `send-push-notification` Edge Function exists but incomplete
- Push notification code in mobile services
- Capacitor push notification plugin installed
- No FCM or APNs configured (good - nothing to clean up there)

## Decision
Email notifications only - no mobile push notifications needed at this time.

## Work to be Done

### 1. Remove Capacitor Plugin
Remove push notification plugin from dependencies:
```bash
npm uninstall @capacitor/push-notifications
```

### 2. Update package.json
Remove from dependencies:
- `@capacitor/push-notifications`

### 3. Remove Edge Function
Delete the incomplete push notification Edge Function:
- `supabase/functions/send-push-notification/index.ts`

### 4. Remove Client-Side Code
Delete push notification related files:
- `src/services/mobilePushNotifications.ts`
- `src/hooks/useMobilePushNotifications.ts`
- `src/components/mobile/PushNotificationTest.tsx`

### 5. Update Mobile Initializer
Remove push notification initialization from:
- `src/components/mobile/MobileInitializer.tsx`
  - Remove push notification imports
  - Remove permission requests
  - Remove token registration

### 6. Database Table - Keep or Remove?
**Option A: Keep `device_tokens` table (RECOMMENDED)**
- Leave table in database (doesn't hurt)
- May use for future web push or in-app notifications
- No code references it currently

**Option B: Remove `device_tokens` table**
- Create migration to drop table
- Remove completely
- Would need to recreate if ever needed

Recommendation: **Keep the table** - it's not causing issues and provides future flexibility.

### 7. Update Notification Preferences
Update `notification_preferences` table usage:
- Keep `email_notifications` column (in use)
- `push_notifications` column can stay (unused, but harmless)
- All notification logic routes through email only

### 8. Clean Up Imports
Search for and remove unused imports:
```bash
grep -r "PushNotifications" src/
grep -r "mobilePushNotifications" src/
```
Remove any leftover imports in components.

### 9. Update Documentation
Update docs to reflect email-only notifications:
- Remove push notification references
- Document email notification flow
- Update architecture diagrams

### 10. Future Consideration
If push notifications are needed later:
- Web Push API (browser-based, no mobile app needed)
- In-app notifications (when user is using app)
- SMS notifications (via existing infrastructure)
- Keep using email as primary channel

## Files to Delete
- `supabase/functions/send-push-notification/index.ts`
- `src/services/mobilePushNotifications.ts`
- `src/hooks/useMobilePushNotifications.ts`
- `src/components/mobile/PushNotificationTest.tsx`

## Files to Update
- `package.json` - Remove push notification plugin
- `src/components/mobile/MobileInitializer.tsx` - Remove push init code
- Any components importing push notification code

## Database Tables
**Keep (do nothing):**
- `device_tokens` - Leave in place for future use
- `notification_preferences` - Already handles email preferences

## Capacitor Configuration
**Keep (do nothing):**
- `capacitor.config.ts` - No push-specific config to remove
- iOS/Android configs - No push setup done yet

## Benefits of Removal
- Simpler codebase
- Fewer dependencies to maintain
- No FCM/APNs setup needed
- No server keys to manage
- Reduced complexity
- Focus on email notifications (what actually works)

## Email Notification Flow (Current)
This is what we're keeping and improving:
1. Event occurs (new review, response, etc.)
2. Check `notification_preferences` for user
3. If email enabled, send via Resend
4. Log in `notifications_log` table
5. User receives email with link to app

## Deliverables
- Push notification code removed
- Dependencies cleaned up
- Simpler, focused notification system
- Email notifications as primary channel
- Clean codebase without unused code
- Documentation updated to reflect email-only approach
