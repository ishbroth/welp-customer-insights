# Push Notifications Completion Plan

## Overview
Complete the push notification implementation for both iOS and Android platforms.

## Current State
- `device_tokens` table exists in database
- `send-push-notification` Edge Function exists but incomplete
- Uses hardcoded FCM endpoint (no SDK)
- No APNs support for iOS
- No proper error handling or retry logic
- Missing FCM_SERVER_KEY configuration

## Work to be Done

### 1. Set Up Firebase Cloud Messaging (FCM)
**For Android:**
- Create Firebase project
- Add Android app to Firebase
- Download `google-services.json`
- Place in `android/app/`
- Update `android/app/build.gradle` with FCM dependencies

**Configuration:**
- Get Server Key from Firebase Console
- Store as Supabase Edge Function secret:
  ```bash
  supabase secrets set FCM_SERVER_KEY=<your-key>
  ```

### 2. Set Up Apple Push Notification Service (APNs)
**For iOS:**
- Create APNs certificate in Apple Developer
- Configure in Xcode: Capabilities → Push Notifications
- Create APNs authentication key (.p8 file)
- Store key details as Edge Function secrets:
  ```bash
  supabase secrets set APNS_KEY_ID=<key-id>
  supabase secrets set APNS_TEAM_ID=<team-id>
  supabase secrets set APNS_KEY=<base64-encoded-p8-file>
  ```

### 3. Rewrite Edge Function
Rewrite `supabase/functions/send-push-notification/index.ts`:

**Use proper SDKs:**
- Import Firebase Admin SDK for Deno
- Implement APNs token-based authentication
- Support both platforms in single function

**Features to implement:**
- Platform detection (iOS vs Android)
- Proper payload formatting for each platform
- Badge count management
- Sound configuration
- Data payloads
- Priority settings

**Error handling:**
- Retry logic for transient failures
- Invalid token removal
- Rate limit handling
- Logging all attempts

### 4. Update Device Token Registration
Update `src/services/mobilePushNotifications.ts`:

**Registration flow:**
```typescript
// Request permission
// Get device token from Capacitor
// Store in device_tokens table with platform
// Handle token refresh
```

**Token management:**
- Delete old tokens on logout
- Update tokens on refresh
- Track platform (iOS/Android)
- Track app version

### 5. Client-Side Integration
Update `src/hooks/useMobilePushNotifications.ts`:

**Implement:**
- Permission requesting
- Token registration
- Foreground notification handling
- Background notification handling
- Notification click handling
- Deep linking from notifications

### 6. Notification Types
Define notification types to send:
- New review received (business)
- Business responded (customer)
- Conversation message (both)
- Review claimed (customer)
- Subscription expiring (business)
- Credits low (business)

### 7. Notification Preferences Integration
Connect to `notification_preferences` table:
- Check preferences before sending
- Respect user's push notification settings
- Allow granular control per notification type

### 8. Create Notification Triggers
Update Edge Functions that should trigger notifications:
- Review submission → Notify business
- Response creation → Notify customer
- Conversation message → Notify recipient
- Review claim → Notify business

### 9. Payload Standardization
Create consistent payload structure:
```typescript
{
  notification: {
    title: string
    body: string
    image?: string
  },
  data: {
    type: 'review' | 'response' | 'conversation' | 'system'
    id: string
    deepLink: string
  }
}
```

### 10. Deep Linking
Implement deep link handling:
- Define URL schemes
- Handle notification taps
- Navigate to correct screen
- Pass data to destination

### 11. Testing Infrastructure
Set up testing:
- Test notification component
- Send test notification button
- Test with Firebase Console
- Test with real devices (not just simulators)

### 12. Badge Management
Implement badge counters:
- Update badge on new notifications
- Clear badge on app open
- Clear badge on notification read
- Sync with server state

### 13. Notification Center Integration
Handle notification display:
- Group notifications by type
- Summary notifications
- Notification actions (reply, mark as read)
- Clear all notifications

### 14. Analytics and Monitoring
Track notification metrics:
- Delivery success rate
- Open rate
- Failed deliveries
- Token invalidation rate
- Log to `notifications_log` table

## Files to Create
- `supabase/functions/_shared/pushNotifications.ts` - Shared notification utilities
- `supabase/functions/_shared/fcm.ts` - FCM integration
- `supabase/functions/_shared/apns.ts` - APNs integration
- `src/services/notificationHandlers.ts` - Client notification handlers
- `src/config/notifications.ts` - Notification configuration
- `docs/mobile/push-notifications.md` - Documentation

## Files to Update
- `supabase/functions/send-push-notification/index.ts` - Complete rewrite
- `src/services/mobilePushNotifications.ts` - Enhance registration
- `src/hooks/useMobilePushNotifications.ts` - Add handlers
- `src/components/mobile/MobileInitializer.tsx` - Initialize push
- `android/app/build.gradle` - Add FCM dependencies
- `ios/App/App/AppDelegate.swift` - Add APNs registration

## Configuration Files to Add
- `android/app/google-services.json` - Firebase config
- `ios/App/App/GoogleService-Info.plist` - Firebase config (iOS)

## Testing Checklist
- [ ] Android receives notifications
- [ ] iOS receives notifications
- [ ] Foreground notifications display
- [ ] Background notifications work
- [ ] Notification tap opens correct screen
- [ ] Badge counts update correctly
- [ ] Preferences are respected
- [ ] Invalid tokens are removed
- [ ] Errors are logged
- [ ] Retry logic works

## Deliverables
- Fully functional push notifications on Android
- Fully functional push notifications on iOS
- Proper error handling and retry logic
- Notification preferences integration
- Deep linking from notifications
- Badge management
- Analytics and monitoring
- Comprehensive documentation
