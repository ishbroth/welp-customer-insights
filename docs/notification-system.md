
# Notification System Documentation

## Overview
Comprehensive notification system supporting email, push notifications, and in-app alerts with user preferences and delivery tracking.

## Core Components

### Main Files
- `src/hooks/useNotifications.ts` - Notification management hook
- `src/components/notifications/` - Notification UI components
- `supabase/functions/send-notification/` - Notification delivery
- `supabase/functions/send-email/` - Email notification service

### Database Schema

#### notification_preferences Table
```sql
- id: uuid (primary key)
- user_id: uuid (references profiles.id)
- email_notifications: boolean
- push_notifications: boolean
- new_reviews: boolean
- review_responses: boolean
- customer_responses: boolean
- review_reactions: boolean
- created_at: timestamp
- updated_at: timestamp
```

#### notifications_log Table
```sql
- id: uuid (primary key)
- user_id: uuid
- notification_type: text
- channel: text (email, push, in_app)
- subject: text
- content: text
- status: text (sent, failed, pending)
- sent_at: timestamp
- error_message: text
```

#### device_tokens Table
```sql
- id: uuid (primary key)
- user_id: uuid
- token: text (device push token)
- platform: text (ios, android, web)
- created_at: timestamp
- updated_at: timestamp
```

### Notification Types

#### Review Notifications
- New review created
- Review claimed by customer
- Review response added
- Review updated or edited

#### User Notifications
- Account verification status
- Password reset requests
- Profile updates
- Subscription changes

#### System Notifications
- Maintenance announcements
- Feature updates
- Policy changes
- Security alerts

### Delivery Channels

#### Email Notifications
- HTML email templates
- Personalized content
- Unsubscribe links
- Delivery tracking

#### Push Notifications
- Mobile push notifications
- Web push notifications
- Rich notification content
- Action buttons

#### In-App Notifications
- Real-time notification feed
- Notification badges
- Interactive notifications
- Notification history

### Email System Integration

#### Resend.com Integration
- Email template management
- Delivery confirmation
- Bounce handling
- Spam compliance

#### Email Templates
- Welcome emails
- Verification confirmations
- Review notifications
- Billing notifications

### Push Notification System

#### Device Registration
- Push token collection
- Device platform detection
- Token refresh handling
- Multi-device support

#### Notification Delivery
- Platform-specific formatting
- Rich media support
- Action buttons
- Deep linking

### User Preferences

#### Preference Management
- Granular notification controls
- Channel-specific settings
- Category-based preferences
- Global opt-out options

#### Preference UI
- Settings page integration
- Real-time preference updates
- Preview functionality
- Default settings

### Notification Scheduling

#### Immediate Delivery
- Real-time notifications
- Event-triggered alerts
- High-priority messages
- Emergency notifications

#### Scheduled Delivery
- Digest notifications
- Weekly summaries
- Batch processing
- Time zone optimization

### Delivery Tracking

#### Success Metrics
- Delivery confirmation
- Open rates (email)
- Click-through rates
- Engagement metrics

#### Error Handling
- Delivery failures
- Retry mechanisms
- Dead letter queues
- Error logging

## Implementation Details

### Notification Hook
```typescript
export const useNotifications = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const sendNotification = async (
    type: NotificationType,
    content: NotificationContent
  ) => {
    // Notification sending logic
  };
  
  const updatePreferences = async (newPreferences: NotificationPreferences) => {
    // Preference update logic
  };
  
  return {
    preferences,
    notifications,
    sendNotification,
    updatePreferences
  };
};
```

### Email Notification Service
```typescript
// Edge function for email sending
export const sendEmailNotification = async (
  recipientEmail: string,
  template: string,
  data: any
) => {
  const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
  
  const emailContent = renderTemplate(template, data);
  
  const result = await resend.emails.send({
    from: 'Welp <notifications@welp.com>',
    to: recipientEmail,
    subject: emailContent.subject,
    html: emailContent.html
  });
  
  return result;
};
```

### Push Notification Service
```typescript
// Push notification delivery
export const sendPushNotification = async (
  deviceTokens: string[],
  notification: PushNotificationData
) => {
  // Platform-specific push delivery logic
  for (const token of deviceTokens) {
    await deliverPushNotification(token, notification);
  }
};
```

## Testing Scenarios

### Notification Testing
1. **Email Delivery Testing**
   - Template rendering
   - Delivery confirmation
   - Spam filter avoidance
   - Unsubscribe functionality

2. **Push Notification Testing**
   - Device registration
   - Notification delivery
   - Platform compatibility
   - Action handling

3. **Preference Testing**
   - Setting updates
   - Opt-out functionality
   - Channel selection
   - Default preferences

## Security Considerations

### Data Protection
- Personal data encryption
- Secure token storage
- Privacy compliance
- Opt-out enforcement

### Content Security
- Template injection prevention
- Content sanitization
- Spam prevention
- Phishing protection

## Performance Optimization

### Delivery Performance
- Batch processing
- Queue management
- Rate limiting
- Load balancing

### Database Performance
- Indexed queries
- Efficient joins
- Archive strategies
- Cleanup processes

## Monitoring and Analytics

### Delivery Metrics
- Success rates by channel
- Response times
- Error frequencies
- User engagement

### User Analytics
- Preference trends
- Notification effectiveness
- Unsubscribe rates
- Channel preferences

## Configuration Options

### Notification Settings
- Default preferences
- Rate limiting rules
- Template configurations
- Channel priorities

### Delivery Settings
- Retry attempts
- Timeout values
- Batch sizes
- Scheduling rules

## Future Enhancements

### Planned Features
- SMS notifications
- Slack integration
- Webhook notifications
- Advanced scheduling

### Technical Improvements
- A/B testing for templates
- Predictive delivery timing
- Advanced personalization
- Real-time analytics

## Troubleshooting Guide

### Common Issues
1. **Email Delivery Problems**
   - DNS configuration
   - Spam filter issues
   - Template rendering errors
   - Rate limiting

2. **Push Notification Failures**
   - Token registration issues
   - Platform compatibility
   - Certificate problems
   - Network connectivity

3. **Preference Sync Issues**
   - Database updates
   - Cache invalidation
   - User interface sync
   - Default settings

## API Documentation

### Notification Management
```typescript
// Send notification
const { data } = await supabase.functions.invoke('send-notification', {
  body: {
    userId: userId,
    type: 'new_review',
    content: notificationContent,
    channels: ['email', 'push']
  }
});

// Update preferences
const { error } = await supabase
  .from('notification_preferences')
  .update(preferences)
  .eq('user_id', userId);

// Register device token
const { error } = await supabase
  .from('device_tokens')
  .upsert({
    user_id: userId,
    token: deviceToken,
    platform: 'ios'
  });
```
