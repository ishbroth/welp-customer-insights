# Notification Edge Functions

Email notifications for reviews and conversations. No push notifications.

## send-notification

Send email notification for review reports.

- **Path**: `supabase/functions/send-notification/index.ts`
- **Auth Required**: Yes (JWT verified)
- **Parameters**: `{ type: string, recipientEmail: string, data: object }`
- **Returns**: `{ success: boolean }`
- **Email**: Sends via Resend
- **Database**: None (direct email sending)
- **Called From**: Frontend forms, other Edge Functions

**Notification Types**:
- `review_report` - Review report submitted

**Flow**:
1. Receive notification request with type and data
2. Generate email subject and HTML content based on type
3. Send email via Resend API
4. Return success/failure response

**Metadata Example**:
```json
// Review report
{
  "type": "review_report",
  "recipientEmail": "support@mywelp.com",
  "data": {
    "reviewId": "uuid",
    "reporterName": "John Doe",
    "reporterEmail": "john@example.com",
    "reporterPhone": "+1234567890",
    "isAboutReporter": true,
    "complaint": "This review is defamatory"
  }
}
```

---

## conversation-notification

Send email notification for conversation messages.

- **Path**: `supabase/functions/conversation-notification/index.ts`
- **Auth Required**: Yes (JWT verified)
- **Parameters**: `{ reviewId: string, messageId: string, authorId: string, authorType: 'business' | 'customer', content: string }`
- **Returns**: `{ message: string, recipientId: string, authorName: string }`
- **Email**: Sends via Resend
- **Database**: Check `notification_preferences`, insert `notifications_log`
- **Called From**: After new conversation message created

**Flow**:
1. Check `notification_preferences.email_notifications` for recipient
2. If disabled, skip
3. Send email with conversation link and message preview
4. Insert into `notifications_log`
5. Return success

**Email Content**:
- Sender name
- Message preview (first 100 characters)
- Link to conversation in app
- "Reply" call-to-action

---

## Summary

**Total Functions**: 2

**Email Provider**: Resend
- API Key: `RESEND_API_KEY` in Edge Function secrets

**Notification Preferences**:
- Checked via `notification_preferences.email_notifications`
- Users can opt out in settings

**Deduplication**:
- `send-notification` checks `user_review_notifications` to prevent duplicate review notifications
- Conversation notifications don't deduplicate (every message notifies)

**Database Tables Used**:
- `notification_preferences` - Check if user wants notifications
- `notifications_log` - Record all sent notifications
- `user_review_notifications` - Prevent duplicate review notifications

**Email Templates**:
- New review notification (to business owner)
- New response notification (to customer)
- New conversation message (to either party)

**Triggering Notifications**:

**Review Created**:
1. Customer submits review
2. Frontend calls `send-notification` function
3. Business owner receives email

**Response Created**:
1. Business responds to review
2. Frontend calls `send-notification` function
3. Customer receives email

**Conversation Message**:
1. User sends message in conversation
2. Frontend calls `conversation-notification` function
3. Other participant receives email

**No Push Notifications**:
- Mobile push notifications removed
- See `docs/temp/13-push-notifications-removal.md`
- Email only for now

**Called From Frontend**:
- `src/services/reviewSubmissionService.ts` - After review created
- `src/services/reviewResponseService.ts` - After response created
- `src/services/conversationService.ts` - After message sent

**Related Functions**:
- See `email-functions.md` for other email functions (verification, support)
- See `auth-functions.md` for verification code emails
