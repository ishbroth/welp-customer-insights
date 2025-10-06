# Conversations Schema

Review conversation system for back-and-forth messaging between businesses and customers.

## Tables in This Domain

1. `review_conversations` - Conversation messages on reviews
2. `conversation_participants` - Participant tracking

---

## review_conversations

Conversation threads attached to reviews, allowing businesses and customers to communicate.

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| review_id | uuid | NO | - | Review this conversation is about |
| author_id | uuid | NO | - | User who sent message |
| author_type | text | NO | - | Type of author: 'business' or 'customer' |
| content | text | NO | - | Message text |
| message_order | integer | NO | 0 | Order of message in conversation |
| created_at | timestamptz | NO | now() | Message sent timestamp (UTC) |
| updated_at | timestamptz | NO | now() | Last edit timestamp (UTC) |

### Constraints

- **Primary Key**: `id`
- **Foreign Key**: `review_id` → `reviews(id)` ON DELETE CASCADE
- **Check**: `author_type IN ('business', 'customer')`

### Indexes

- `review_id` (B-tree) - Lookup messages for review
- `created_at` (B-tree) - Chronological ordering

### RLS

- **Enabled**: Yes
- **Policies**:
  - Conversation participants can read messages
  - Participants can create messages
  - Message sender can update/delete their own messages

### Used In

- `src/components/conversation/ConversationThread.tsx` - Message display
- `src/components/conversation/ConversationInput.tsx` - Message composition
- `src/hooks/useConversation.ts` - Conversation logic
- `src/services/conversationService.ts` - Message operations

### Conversation Flow

1. Customer writes review
2. Business responds to review (via `responses` table)
3. Either party starts conversation:
   - Insert into `review_conversations` (first message)
   - Insert participants into `conversation_participants`
4. Back-and-forth messaging:
   - Insert messages into `review_conversations`
   - Send email notifications

### Related Tables

- **References**: `reviews(review_id)`
- **Referenced by**: None
- **Related**: `conversation_participants` (tracks who can participate)

---

## conversation_participants

Tracks who can participate in each conversation (customer and business).

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| review_id | uuid | NO | - | Review conversation is about (unique) |
| customer_id | uuid | NO | - | Customer participant |
| business_id | uuid | NO | - | Business participant |
| first_customer_response_at | timestamptz | YES | NULL | When customer first responded (UTC) |
| created_at | timestamptz | NO | now() | When participation created (UTC) |

### Constraints

- **Primary Key**: `id`
- **Foreign Key**: `review_id` → `reviews(id)` ON DELETE CASCADE
- **Unique**: `review_id` (one participant record per review)

### Indexes

- `review_id` (B-tree) - Lookup participants for review

### RLS

- **Enabled**: Yes
- **Policies**: Service role can create; users can read if they are participants

### Purpose

This table controls access to conversations using a customer/business model:
- Each conversation has exactly one customer and one business
- `customer_id` and `business_id` identify the participants
- Access is granted based on matching these IDs

### Used In

- `src/hooks/useConversation.ts` - Check if user is participant
- `src/services/conversationService.ts` - Enforce participation rules
- RLS policies - Restrict message access to participants

### Query Pattern

```sql
-- Get all conversations user is participating in
SELECT DISTINCT rc.*, cp.*
FROM review_conversations rc
JOIN conversation_participants cp ON cp.review_id = rc.review_id
WHERE cp.customer_id = '...' OR cp.business_id = '...';

-- Check if user can access conversation
SELECT EXISTS(
  SELECT 1
  FROM conversation_participants
  WHERE review_id = '...'
  AND (customer_id = '...' OR business_id = '...')
) as can_access;
```

### Related Tables

- **References**: `reviews(review_id)`
- **Referenced by**: None

---

## Summary

**Total Tables**: 2

**Key Relationships**:
- `reviews` ← `review_conversations.review_id` (one-to-many messages)
- `reviews` ← `conversation_participants.review_id` (one-to-one)

**Conversation Architecture**:

```
review (1)
  ├─ response (0 or 1) - Business response (from responses table)
  └─ conversation (0 to many messages)
     ├─ participants (1 record) - Customer + Business
     └─ messages (1+) - Back-and-forth communication
```

**Starting a Conversation**:
1. Review exists
2. Business has responded (optional)
3. Either party wants to continue discussion
4. Create first message → `review_conversations`
5. Add participants → `conversation_participants` (customer_id + business_id)
6. Future messages reference same `review_id`

**Sending a Message**:
1. Check user is participant (via `conversation_participants`)
2. Insert message into `review_conversations`
3. Send email notification to other participant

**Reading Messages**:
1. User views conversation
2. Load all messages for `review_id` (ordered by `created_at`)
3. Display conversation thread

**Common Query Patterns**:
```sql
-- Get conversation thread for a review
SELECT rc.*
FROM review_conversations rc
WHERE rc.review_id = '...'
ORDER BY rc.message_order ASC, rc.created_at ASC;

-- Get all active conversations for user
SELECT r.*, cp.*, COUNT(rc.id) as message_count
FROM conversation_participants cp
JOIN reviews r ON r.id = cp.review_id
LEFT JOIN review_conversations rc ON rc.review_id = r.id
WHERE cp.customer_id = '...' OR cp.business_id = '...'
GROUP BY r.id, cp.id
ORDER BY MAX(rc.created_at) DESC;
```

**Notification Integration**:
- New message triggers notification
- Email sent via Resend
- Logs notification in `notifications_log`

See `constraints.md` for complete foreign key documentation.
