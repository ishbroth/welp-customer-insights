# Deep Dive: Conversation System

## Overview
The conversation system allows customers and businesses to have back-and-forth messaging on reviews. Conversations are turn-based: customer responds, then business responds, then customer, etc. Each conversation is tied to a single review.

---

## Starting a Conversation

### User Journey (Customer)
1. Customer finds a review about them
2. Review is locked (not yet claimed)
3. Customer clicks "Respond" button
4. Enters response text in dialog
5. Clicks "Send Response"
6. Review is automatically claimed (no credit required)
7. Conversation participants record created
8. First message added to conversation
9. Business receives push notification (if enabled)
10. Customer can now view full review

### User Journey (Business - Cannot Start)
- Businesses CANNOT start conversations
- Only customers can initiate by responding to a review
- Once started, business can participate

### Frontend Implementation

**Button Location**: Search results page, inside review card
- Component: `src/components/search/ReviewCard.tsx`
- Shows "Respond" button if:
  - Review not yet claimed
  - Current user is the customer (matched by search)
  - Review is not anonymous (businesses can't converse on anonymous reviews)

**Dialog Component**: Customer response dialog (inline in ReviewCard)
- Textarea for response content
- "Send Response" button
- Calls `conversationService.startConversation()`

**Hook**: `src/hooks/useConversation.ts`
- `startConversation(content)` function (line 86-111):
  1. Validates content not empty
  2. Calls `conversationService.startConversation(reviewId, customerId, content)`
  3. Shows success toast
  4. Refreshes conversation data
  5. Review now appears as "unlocked"

**Service**: `src/services/conversationService.ts`
- `startConversation(reviewId, customerId, content)` function (line 56-84):
  1. Calls `claim_review_via_conversation` RPC function
  2. RPC returns message ID
  3. Calls `conversation-notification` edge function (async, best-effort)
  4. Returns message ID

### Backend Implementation

**RPC Function**: `claim_review_via_conversation(p_review_id, p_customer_id, p_content)`
- Location: Supabase database function (Postgres PL/pgSQL)
- Logic:
  1. Get review details: `SELECT business_id FROM reviews WHERE id = p_review_id`
  2. Create conversation participants:
     ```sql
     INSERT INTO conversation_participants (review_id, customer_id, business_id, first_customer_response_at)
     VALUES (p_review_id, p_customer_id, business_id, NOW())
     ```
  3. Add first message:
     ```sql
     INSERT INTO review_conversations (review_id, author_id, author_type, content, message_order)
     VALUES (p_review_id, p_customer_id, 'customer', p_content, 1)
     RETURNING id
     ```
  4. Return message ID
- **ATOMIC**: Entire operation in single transaction
- **Prevents race conditions**: Unique constraint on `conversation_participants.review_id`

**Edge Function**: `supabase/functions/conversation-notification/index.ts`
- Triggered after message creation
- Input: `{ reviewId, messageId, authorId, authorType, content }`
- Logic:
  1. Get conversation participants (line 29-45)
  2. Determine recipient: If author is customer, notify business, and vice versa
  3. Check notification preferences (line 52-66)
  4. Get author profile for display name (line 69-89)
  5. Send push notification if enabled (line 96-129)
  6. Log notification to `notifications_log` (line 132-141)

### Database Operations

**INSERT**: `conversation_participants`
```sql
{
  review_id: UUID (FK to reviews, UNIQUE),
  customer_id: UUID (FK to profiles),
  business_id: UUID (FK to profiles),
  first_customer_response_at: timestamp,
  created_at: timestamp (auto)
}
```

**INSERT**: `review_conversations`
```sql
{
  review_id: UUID (FK to reviews),
  author_id: UUID (FK to profiles),
  author_type: 'customer' | 'business',
  content: text,
  message_order: number (auto-incremented),
  created_at: timestamp (auto)
}
```

**INSERT**: `notifications_log` (via edge function)
```sql
{
  user_id: UUID (recipient),
  notification_type: 'conversation_response',
  channel: 'push',
  subject: "New response from {name}",
  content: "{name} responded: {preview}",
  status: 'sent' | 'failed'
}
```

### Notifications

**Push Notification** (Mobile only):
- Title: "New response from {authorName}"
- Body: "{authorName} responded to a review conversation: {contentPreview}"
- Data payload:
  ```json
  {
    "type": "conversation_response",
    "reviewId": "...",
    "messageId": "...",
    "authorId": "..."
  }
  ```
- Sent to all registered devices for recipient

**Email Notification** (TODO - not yet implemented):
- Should send email via Resend
- Subject: "New response to your review"
- Currently only push notifications are sent

---

## Continuing a Conversation

### User Journey
1. User views a review with active conversation
2. Sees message thread
3. If it's their turn, sees "Reply" input
4. Enters reply text
5. Clicks "Send"
6. Message added to thread
7. Other participant receives notification
8. Their turn now

### Frontend Implementation

**Display Component**: `src/components/conversation/ConversationThread.tsx`
- Lists all messages chronologically
- Each message shows:
  - Author name (or business name)
  - Author avatar
  - Message content
  - Timestamp
- Messages styled differently for customer vs business

**Input Component**: `src/components/conversation/ConversationInput.tsx`
- Textarea for message content
- "Send" button
- Only visible if `canRespond: true`
- Disabled during submission

**Hook**: `src/hooks/useConversation.ts`
- Loads conversation data on mount
- `messages` - Array of all messages
- `userProfiles` - Map of author IDs to profile data
- `canRespond` - Boolean, whether current user can reply
- `addMessage(content)` function (line 114-144):
  1. Calls `conversationService.addMessage()`
  2. Shows success toast
  3. Refreshes conversation

**Service**: `src/services/conversationService.ts`
- `addMessage(reviewId, authorId, authorType, content)` function (line 88-118):
  1. Calls `add_conversation_message` RPC
  2. Triggers `conversation-notification` edge function
  3. Returns message ID

### Backend Implementation

**RPC Function**: `add_conversation_message(p_review_id, p_author_id, p_author_type, p_content)`
- Location: Supabase database function
- Logic:
  1. Verify conversation exists:
     ```sql
     SELECT * FROM conversation_participants WHERE review_id = p_review_id
     ```
  2. Get next message order:
     ```sql
     SELECT COALESCE(MAX(message_order), 0) + 1 FROM review_conversations WHERE review_id = p_review_id
     ```
  3. Insert message:
     ```sql
     INSERT INTO review_conversations (review_id, author_id, author_type, content, message_order)
     VALUES (p_review_id, p_author_id, p_author_type, p_content, next_order)
     RETURNING id
     ```
  4. Return message ID

**Edge Function**: `supabase/functions/conversation-notification/index.ts` (same as start conversation)

### Turn-Based Logic

**Service**: `src/services/conversationService.ts`
- `canUserRespond(reviewId, userId, userType, customerId)` function (line 136-188):
  1. Check if review is anonymous + user is business → return false (line 137-147)
  2. Get conversation participants (line 149)
  3. If no participants:
     - Customer can start if they're the subject of the review
     - Business cannot start
  4. Check if user is a participant (line 162-166)
  5. Get last message (line 169-172)
  6. If no messages: Only customer can send first message
  7. If last message from customer: Business can reply
  8. If last message from business: Customer can reply
  9. Turn alternates

**Visual Indicator**:
- "Waiting for customer to respond"
- "Waiting for business to respond"
- Shown when `canRespond: false`

---

## Viewing Conversations

### User Journey
1. User views a review they're involved with
2. Sees conversation tab/section
3. Clicks to expand full conversation
4. Sees message history
5. Can reply if it's their turn

### Frontend Implementation

**Component**: `src/components/conversation/ReviewConversationSection.tsx`
- Shows conversation status:
  - "No conversation yet"
  - "Conversation active - X messages"
- Expandable to show full thread
- Uses `useConversation` hook

**Hook**: `src/hooks/useConversation.ts`
- `fetchConversation()` function (line 19-83):
  1. Check if conversation exists via `conversationService.hasConversation()`
  2. If exists: Load messages via `conversationService.getConversation()`
  3. Load author profiles for all message authors
  4. For business authors, also load business_info.business_name
  5. Store in `userProfiles` map for display

**Service**: `src/services/conversationService.ts`
- `getConversation(reviewId)` - Returns all messages ordered by `message_order`
- `hasConversation(reviewId)` - Checks if `conversation_participants` record exists
- `getParticipants(reviewId)` - Returns participant IDs

### Database Query
```sql
SELECT * FROM review_conversations
WHERE review_id = {reviewId}
ORDER BY message_order ASC
```

---

## Anonymous Review Restrictions

### Special Rule
If a review is marked `is_anonymous: true`, the business owner CANNOT participate in conversations about that review.

### Implementation

**Check**: `conversationService.canUserRespond()` (line 137-147)
```typescript
const { data: review } = await supabase
  .from('reviews')
  .select('is_anonymous, business_id')
  .eq('id', reviewId)
  .single();

// If review is anonymous and user is the business owner, they cannot participate
if (review?.is_anonymous && userType === 'business' && review.business_id === userId) {
  return false;
}
```

**Result**:
- Business owner sees conversation but cannot reply
- Customer can still respond
- Allows customers to communicate without direct business interaction

---

## Notification Preferences

### User Control
Users can control whether they receive conversation notifications.

### Database Table
**notification_preferences**
```sql
user_id (uuid, PK, FK to profiles)
email_notifications (boolean, default true)
push_notifications (boolean, default true)
review_responses (boolean, default true) -- Conversation notifications
new_reviews (boolean, default true)
customer_responses (boolean, default true)
```

### Check Before Sending
Edge function checks `review_responses` preference before sending notification (line 52-66 in conversation-notification/index.ts):
```typescript
const { data: preferences } = await supabase
  .from('notification_preferences')
  .select('review_responses, push_notifications, email_notifications')
  .eq('user_id', recipientId)
  .single();

if (!preferences || !preferences.review_responses) {
  // Skip notification
  return;
}
```

---

## Message History & Persistence

### Storage
- All messages stored indefinitely
- No automatic deletion
- Soft-delete option for future

### Retrieval
- Messages loaded on demand (not real-time)
- Refresh required to see new messages
- React Query caching for performance

### Archive (Future Feature)
- Ability to archive conversations
- Hidden from active view
- Still accessible via link

---

## Real-Time Updates (Not Implemented)

### Current Behavior
- User must refresh to see new messages
- No automatic polling
- Manual refresh via button

### Future Enhancement (Supabase Realtime)
```typescript
const channel = supabase
  .channel(`conversation:${reviewId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'review_conversations',
    filter: `review_id=eq.${reviewId}`
  }, (payload) => {
    // Add new message to UI
  })
  .subscribe();
```

---

## Database Schema

### conversation_participants
```sql
CREATE TABLE conversation_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID UNIQUE NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES profiles(id),
  business_id UUID NOT NULL REFERENCES profiles(id),
  first_customer_response_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX idx_conversation_participants_review_id ON conversation_participants(review_id);
```

### review_conversations
```sql
CREATE TABLE review_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id),
  author_type TEXT NOT NULL CHECK (author_type IN ('business', 'customer')),
  content TEXT NOT NULL,
  message_order INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_review_conversations_review_id ON review_conversations(review_id);
CREATE INDEX idx_review_conversations_author_id ON review_conversations(author_id);
CREATE UNIQUE INDEX idx_review_conversations_order ON review_conversations(review_id, message_order);
```

---

## RLS Policies

### conversation_participants
```sql
-- Users can view conversations they're part of
CREATE POLICY "view_own_conversations" ON conversation_participants
FOR SELECT USING (
  customer_id = auth.uid() OR
  business_id = auth.uid()
);

-- Only customers can create conversations
CREATE POLICY "customers_create_conversations" ON conversation_participants
FOR INSERT WITH CHECK (
  customer_id = auth.uid()
);
```

### review_conversations
```sql
-- Participants can view messages
CREATE POLICY "view_conversation_messages" ON review_conversations
FOR SELECT USING (
  review_id IN (
    SELECT review_id FROM conversation_participants
    WHERE customer_id = auth.uid() OR business_id = auth.uid()
  )
);

-- Participants can add messages
CREATE POLICY "add_conversation_messages" ON review_conversations
FOR INSERT WITH CHECK (
  author_id = auth.uid() AND
  review_id IN (
    SELECT review_id FROM conversation_participants
    WHERE customer_id = auth.uid() OR business_id = auth.uid()
  )
);
```

---

## Common Issues & Solutions

### Issue: Can't reply to conversation
**Solution**: Check if it's your turn, messages alternate

### Issue: Notification not received
**Solution**: Check notification_preferences.review_responses

### Issue: Can't start conversation as business
**Solution**: Only customers can start conversations

### Issue: Anonymous review conversation blocked
**Solution**: Business owners cannot converse on their own anonymous reviews

### Issue: Messages out of order
**Solution**: message_order field ensures correct ordering
