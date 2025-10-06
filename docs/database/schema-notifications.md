# Notifications Schema

Email notification system via Resend. No push notifications.

## Tables in This Domain

1. `notification_preferences` - User notification settings
2. `notifications_log` - Notification history
3. `device_tokens` - Reserved for future use
4. `user_review_notifications` - Review-specific notification tracking

---

## notification_preferences

User notification settings (email only).

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| user_id | uuid | NO | - | User these preferences belong to (links to auth.users) |
| review_responses | boolean | NO | true | Notify on review responses |
| review_reactions | boolean | NO | true | Notify on review reactions |
| customer_responses | boolean | NO | true | Notify on customer responses |
| new_reviews | boolean | NO | true | Notify on new reviews |
| email_notifications | boolean | NO | true | Email notifications enabled |
| push_notifications | boolean | NO | false | Reserved (not used) |
| created_at | timestamptz | NO | now() | Record creation (UTC) |
| updated_at | timestamptz | NO | now() | Last update (UTC) |

### Constraints

- **Primary Key**: `id`
- **Foreign Key**: `user_id` → `auth.users(id)`
- **Unique**: `user_id` (one preference record per user)

### RLS

- **Enabled**: Yes
- **Policies**: Users can read/update their own preferences

### Used In

- `src/hooks/useNotificationPreferences.ts` - Preference access

### Email Notifications Sent For

- New review on your business
- Response to your review
- New message in conversation
- Business verification approved
- Subscription status changes
- Credit purchase confirmation

### Push Notifications

**Status**: Not implemented

### Related Tables

- **References**: `auth.users(user_id)`
- **Referenced by**: None

---

## notifications_log

History of all sent notifications.

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| user_id | uuid | NO | - | Recipient user (links to auth.users) |
| notification_type | text | NO | - | Type of notification |
| channel | text | NO | 'email' | Delivery channel |
| subject | text | YES | NULL | Email subject |
| content | text | NO | - | Notification content |
| status | text | NO | 'sent' | Delivery status |
| error_message | text | YES | NULL | Error message if failed |
| sent_at | timestamptz | NO | now() | When notification sent (UTC) |

### Constraints

- **Primary Key**: `id`
- **Foreign Key**: `user_id` → `auth.users(id)`

### Indexes

- `user_id` (B-tree) - Lookup notifications for user
- `sent_at` (B-tree) - Chronological ordering

### RLS

- **Enabled**: Yes
- **Policies**: Users can read their own notification log; service role can create

### Notification Types

- Review/response notifications
- Conversation messages
- Business verification
- Subscription changes
- Credit purchases

### Used In

- Notification history features

### Related Tables

- **References**: `auth.users(user_id)`
- **Referenced by**: None

---

## device_tokens

Reserved for future web push or in-app notifications.

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| user_id | uuid | NO | - | User this token belongs to |
| token | text | NO | - | Device/push token |
| platform | text | NO | - | Platform type |
| created_at | timestamptz | NO | now() | Token creation (UTC) |
| updated_at | timestamptz | NO | now() | Last update (UTC) |

### Constraints

- **Primary Key**: `id`
- **Foreign Keys**: None - No foreign key constraint on user_id

### RLS

- **Enabled**: Yes
- **Policies**: Service role only

### Status

**Currently Unused**

Table exists but no code references it. Reserved for future use if web push notifications or in-app notifications are needed.

### Related Tables

- **References**: None
- **Referenced by**: None

---

## user_review_notifications

Track which review notifications have been sent to prevent duplicates.

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| user_id | uuid | YES | NULL | User who was notified (links to auth.users) |
| review_id | uuid | YES | NULL | Review that triggered notification |
| shown_at | timestamptz | YES | now() | When notification sent (UTC) |

### Constraints

- **Primary Key**: `id`
- **Foreign Key**: `user_id` → `auth.users(id)`
- **Foreign Key**: `review_id` → `reviews(id)`

### Indexes

- `user_id` (B-tree) - Lookup notifications for user
- `review_id` (B-tree) - Lookup notifications for review

### RLS

- **Enabled**: Yes
- **Policies**: Service role only

### Used In

- Notification services
- Prevents sending multiple notifications for same review

### Deduplication Logic

Before sending notification:
```sql
SELECT * FROM user_review_notifications
WHERE user_id = '...'
AND review_id = '...';

-- If exists, don't send again
```

### Related Tables

- **References**: `auth.users(user_id)`, `reviews(review_id)`
- **Referenced by**: None

---

## Summary

**Total Tables**: 4

**Key Relationships**:
- `auth.users` ← `notification_preferences.user_id` (one-to-one)
- `auth.users` ← `notifications_log.user_id` (one-to-many)
- `auth.users` ← `user_review_notifications.user_id` (one-to-many)
- `reviews` ← `user_review_notifications.review_id` (one-to-many)

**Notification Flow**:

1. Event occurs (new review, response, etc.)
2. Check `notification_preferences.email_notifications` for recipient
3. If enabled, check `user_review_notifications` for duplicates (review notifications only)
4. Send email via Resend (Edge Function)
5. Insert into `notifications_log` (success or error)
6. Insert into `user_review_notifications` (if review notification)

**Email Provider**: Resend (not Twilio)

**Common Query Patterns**:
```sql
-- Check if user wants email notifications
SELECT email_notifications
FROM notification_preferences
WHERE user_id = '...';

-- Get notification history for user
SELECT * FROM notifications_log
WHERE user_id = '...'
ORDER BY sent_at DESC
LIMIT 50;

-- Check if review notification already sent
SELECT * FROM user_review_notifications
WHERE user_id = '...'
AND review_id = '...';
```

See `constraints.md` for complete foreign key documentation.
