# Deep Dive: Review System

## Overview
Welp allows businesses to write reviews about customers. Reviews can include ratings (1-5 stars), text content, photos, and associate names. Reviews can be marked anonymous to hide them from the business dashboard.

---

## Review Submission Flow

### User Journey
1. Business logs in
2. Navigates to `/review/new`
3. Fills out review form:
   - Star rating (1-5)
   - Customer info (name, phone, address)
   - Optional: Customer nickname, business name, associates
   - Review text content
   - Optional: Upload up to 5 photos
   - Optional: Mark as anonymous
4. Clicks "Submit Review"
5. Duplicate check performed
6. Photos uploaded to Supabase Storage
7. Review saved to database
8. Business notified via email (TODO: not yet implemented for new reviews)
9. Redirect to `/profile/business-reviews`

### Frontend Implementation

**Page**: `src/pages/NewReview.tsx`
- Main review creation page
- Uses `useReviewFormState` hook for all form state
- Uses `useReviewSubmission` hook for submission logic
- Uses `useDuplicateReviewCheck` hook to prevent duplicates
- Uses `useSelfReviewCheck` hook to prevent businesses from reviewing themselves

**Form State Hook**: `src/hooks/useReviewFormState.ts` (394 lines)
- **State** (lines 20-60):
  - `rating` (1-5 stars)
  - `comment` (review text)
  - `customerFirstName`, `customerLastName`, `customerNickname`, `customerBusinessName`
  - `customerPhone`, `customerAddress`, `customerCity`, `customerState`, `customerZipCode`
  - `associates` (array of {firstName, lastName}, max 3)
  - `photos` (array of File objects, max 5)
  - `isAnonymous` (boolean)

- **Features**:
  - Loads existing review data if editing (line 100-200)
  - Validates required fields
  - Manages photo preview URLs
  - Clears state on submission success

**Form Component**: `src/components/reviews/ReviewForm.tsx`
- Renders form sections:
  - `RatingInput` - 5-star rating selector
  - `PersonalInfoSection` - Customer name fields
  - `ContactInfoSection` - Phone number
  - `AddressInfoSection` - Full address
  - `AssociatesInput` - Up to 3 associate names
  - `ReviewTextInput` - Main review content
  - `PhotoUpload` - Photo upload (max 5 images)
  - Anonymous checkbox
- Submit button disabled if:
  - Missing required fields
  - Submitting in progress
  - Duplicate check in progress
  - Self-review detected

**Submission Hook**: `src/hooks/useReviewSubmission.ts`
- `submitReview(reviewData)` function (line 30-117):
  1. Validates rating > 0
  2. Validates content (no prohibited content via `useContentValidation`)
  3. Calls `submitReviewToDatabase()` service
  4. Uploads photos via `uploadReviewPhotos()` service
  5. Saves photo records via `savePhotoRecords()`
  6. Shows success toast
  7. Navigates to business reviews page

**Services**:

**`src/services/reviewSubmissionService.ts`** - Database submission
- `submitReviewToDatabase(reviewData, businessId, isEditing, reviewId)` (line 20-181):
  1. **Find or create customer profile** (line 31-86):
     - Query `profiles` for existing customer by phone
     - If found: Update profile with latest info
     - If not found: Create new customer profile with UUID
  2. **Filter associates** (line 88-91):
     - Remove empty entries
     - Limit to 3 associates
  3. **Check for is_anonymous column** (line 93-105):
     - Backward compatibility check
     - Only include if column exists
  4. **Submit review** (line 138-164):
     - If editing: UPDATE existing review
     - If new: INSERT new review with `select().single()`
  5. **Return review ID** for photo uploads

**`src/services/photoUploadService.ts`** - Photo handling
- `uploadReviewPhotos(photos, reviewId, userId, progressCallback)`:
  1. For each photo:
     - Generate unique filename: `{userId}/{reviewId}/{timestamp}-{filename}`
     - Upload to `review-photos` bucket via `supabase.storage.from('review-photos').upload()`
     - Call progress callback for UI updates
  2. Return array of public URLs

- `savePhotoRecords(uploadedPhotos, reviewId, isEditing)`:
  1. If editing: Delete existing photos from `review_photos` table
  2. Insert new photo records with `display_order`

### Backend Implementation

**Direct Database Writes** (no edge function for review creation)
- Reviews written directly to `reviews` table
- Customer profiles created/updated in `profiles` table
- Photos uploaded directly to Supabase Storage

**Notification** (TODO - not yet implemented):
- SHOULD call `send-notification` edge function
- SHOULD send email to customer when review is created
- Currently NO notification sent

### Database Operations

**INSERT/UPDATE**: `reviews` table
```sql
{
  business_id: string (FK to profiles),
  rating: number (1-5),
  content: string,
  customer_name: string,
  customer_nickname: string | null,
  customer_business_name: string | null,
  customer_phone: string,
  customer_address: string,
  customer_city: string,
  customer_state: string,
  customer_zipcode: string,
  associates: JSONB array,
  is_anonymous: boolean (if column exists)
}
```

**INSERT/UPDATE**: `profiles` table (for new customers)
```sql
{
  id: UUID,
  type: 'customer',
  name: "{firstName} {lastName}",
  first_name: string,
  last_name: string,
  phone: string,
  address: string,
  city: string,
  state: string,
  zipcode: string
}
```

**INSERT**: `review_photos` table
```sql
{
  review_id: UUID (FK),
  photo_url: string (Supabase Storage public URL),
  display_order: number (0-4)
}
```

### Storage Upload
- **Bucket**: `review-photos`
- **Path**: `{userId}/{reviewId}/{timestamp}-{filename}`
- **Public Access**: Yes (for unlocked reviews)
- **Max Size**: Configured in Supabase Storage settings

### Duplicate Prevention

**Hook**: `src/hooks/useDuplicateReviewCheck.ts`
- `checkForDuplicateReview(customerData)` function (line 25-95):
  1. Query `reviews` table where:
     - `business_id = currentUser.id`
     - `customer_name ILIKE "${firstName} ${lastName}"`
     - `customer_phone = cleanedPhone`
     - `customer_address ILIKE "%${address}%"`
     - Created within last 30 days
  2. If duplicate found:
     - Return duplicate review data
     - Show `DuplicateReviewDialog`
     - Allow user to edit existing review instead

**Component**: `src/components/reviews/DuplicateReviewDialog.tsx`
- Shows duplicate review info
- Options:
  - "Edit Existing Review" - Navigates to `/review/new?edit={reviewId}`
  - "Submit Anyway" - Allows duplicate (rare case)
  - "Cancel" - Return to form

### Self-Review Prevention

**Hook**: `src/hooks/useSelfReviewCheck.ts`
- Checks if customer phone matches business phone
- If match detected: Block submission, show warning
- Component: `SelfReviewWarning` - Red alert banner

### Content Validation

**Hook**: `src/hooks/useContentValidation.ts`
- Checks review content for prohibited terms
- If prohibited content found:
  - Show `ContentRejectionDialog`
  - Block submission
  - Suggest rephrasing

---

## Review Display (Business Dashboard)

### User Journey
1. Business logs in
2. Navigates to `/profile/business-reviews`
3. Sees all reviews they've written
4. Can filter, search, or sort reviews
5. Can edit or delete own reviews

### Frontend Implementation

**Page**: `src/pages/ProfileReviews.tsx`
- Lists all reviews written by current business
- Uses `useProfileReviewsFetching` hook

**Hook**: `src/hooks/useProfileReviewsFetching.tsx`
- Fetches reviews from `reviews` table
- Filters: `business_id = currentUser.id`
- Includes photo count, response count
- Pagination support

**Display Component**: `src/components/business/BusinessReviewCard.tsx`
- Shows review summary:
  - Customer name (or "Anonymous" if `is_anonymous: true`)
  - Star rating
  - Review content preview
  - Date posted
  - Photo count
- Actions:
  - View full review
  - Edit review
  - Delete review

### Database Query
```sql
SELECT
  reviews.*,
  COUNT(review_photos.id) as photo_count,
  COUNT(responses.id) as response_count
FROM reviews
LEFT JOIN review_photos ON reviews.id = review_photos.review_id
LEFT JOIN responses ON reviews.id = responses.review_id
WHERE reviews.business_id = {currentUserId}
  AND reviews.deleted_at IS NULL
GROUP BY reviews.id
ORDER BY reviews.created_at DESC
```

---

## Review Display (Customer View)

### User Journey
1. Customer searches for their name/phone
2. Sees reviews written about them
3. **LOCKED reviews**: Shows preview only, "Unlock to view full review"
4. **UNLOCKED reviews**: Shows full content + ability to respond

### Frontend Implementation

**Search Results**: `src/pages/SearchResults.tsx`
- Uses `useCustomerSearch` hook
- Displays `CustomerCard` for each match
- Shows reviews inside customer card

**Hook**: `src/hooks/useReviewAccess.ts`
- Tracks which reviews current user has unlocked
- Query `review_claims` table: `claimed_by = currentUser.id`
- Returns array of unlocked review IDs
- Used to show/hide full review content

**Display Component**: `src/components/search/ReviewCard.tsx`
- If unlocked: Shows full review
- If locked: Shows preview + "Unlock" button

### Access Control (RLS)
```sql
-- Policy: Businesses can only see reviews they've claimed
CREATE POLICY "view_claimed_reviews" ON reviews
FOR SELECT USING (
  business_id = auth.uid() OR
  id IN (SELECT review_id FROM review_claims WHERE claimed_by = auth.uid())
);
```

---

## Review Unlock System

### User Journey
1. Customer finds a review about them (locked)
2. Has 2 options:
   - **A. Unlock with Credit**: Spend 1 credit
   - **B. Respond to Start Conversation**: Claim review for free by responding
3. **Option A**: Credit unlock
   - Click "Unlock Review (1 credit)"
   - Credit deducted via `useCredits` hook
   - Review claimed via `claimReview()` RPC
   - Full review content revealed
4. **Option B**: Free claim via response
   - Click "Respond" button
   - Enter response text in dialog
   - Calls `claim_review_via_conversation` RPC
   - Review claimed + conversation started
   - Full review content revealed

### Frontend Implementation

**Hook**: `src/hooks/useReviewClaims.ts`
- `claimReview(reviewId, claimType, creditTransactionId)` function (line 10-65):
  1. Calls `claim_review` RPC function
  2. RPC returns `boolean` (true if successful)
  3. If already claimed: Show toast error
  4. If successful: Refresh review data

**Hook**: `src/hooks/useCredits.ts`
- `useCredits(amount, description)` function (line 101-148):
  1. Check balance >= amount
  2. Call `update_user_credits` RPC with negative amount
  3. Returns `{ success, transactionId }`
  4. UI uses transaction ID for claim record

**Credit Unlock Flow**:
```typescript
// 1. Deduct credit
const { success, transactionId } = await useCredits(1, "Unlock review");

// 2. Claim review
if (success) {
  await claimReview(reviewId, 'credit_unlock', transactionId);
}
```

**Free Claim Flow** (via conversation):
```typescript
// 1. Call claim_review_via_conversation RPC
const messageId = await conversationService.startConversation(
  reviewId,
  customerId,
  content
);

// This automatically:
// - Creates conversation_participants record
// - Adds first message to review_conversations
// - Marks review as claimed (via trigger)
```

### Backend Implementation

**RPC Function**: `claim_review(p_review_id, p_claimed_by, p_claim_type, p_credit_transaction_id)`
- Location: Supabase database function
- Logic:
  1. Check if review already claimed: `SELECT * FROM review_claims WHERE review_id = p_review_id`
  2. If not claimed: INSERT claim record
  3. Return true on success, false if already claimed
- **ATOMIC**: Uses database transaction to prevent race conditions

**RPC Function**: `claim_review_via_conversation(p_review_id, p_customer_id, p_content)`
- Location: Supabase database function
- Logic:
  1. Get review details to find business_id
  2. INSERT conversation_participants record
  3. INSERT first message to review_conversations
  4. Return message ID
- **ATOMIC**: Wrapped in transaction

**Database Trigger** (may exist):
- ON INSERT to `conversation_participants`
- Automatically creates `review_claims` record
- Sets `claim_type = 'conversation_claim'`

### Database Tables

**review_claims**
```sql
id (uuid, PK)
review_id (uuid, FK to reviews, UNIQUE)
claimed_by (uuid, FK to profiles)
claim_type (text: 'credit_unlock' | 'subscription_response' | 'direct_claim' | 'conversation_claim')
credit_transaction_id (uuid, FK to credit_transactions, nullable)
claimed_at (timestamp)
created_at (timestamp)
```

**credit_transactions**
```sql
id (uuid, PK)
user_id (uuid, FK to profiles)
amount (integer, negative for usage)
type (text: 'usage' | 'purchase')
description (text)
stripe_session_id (uuid, nullable)
created_at (timestamp)
```

**credits**
```sql
id (uuid, PK)
user_id (uuid, FK to profiles, UNIQUE)
balance (integer)
created_at (timestamp)
updated_at (timestamp)
```

---

## Review Editing

### User Journey
1. Business navigates to their reviews
2. Clicks "Edit" on a review
3. Redirected to `/review/new?edit={reviewId}`
4. Form pre-populated with existing data
5. Makes changes
6. Clicks "Update Review"
7. Review updated in database
8. Redirect to reviews list

### Frontend Implementation

**URL Param Detection**: `src/pages/NewReview.tsx`
- Checks for `?edit={reviewId}` query param
- If present: Load review data via `useReviewFormState`

**Hook**: `src/hooks/useReviewFormState.ts`
- `loadReviewData(reviewId)` function (line 100-200):
  1. Query `reviews` table for review
  2. Query `review_photos` for existing photos
  3. Populate form state with existing data
  4. Set `isEditing: true` flag

**Service**: `src/services/reviewSubmissionService.ts`
- `submitReviewToDatabase(..., isEditing: true, reviewId)`:
  - Uses UPDATE instead of INSERT (line 141-148)
  - Sets `deleted_at = null` to un-delete if needed

**Photo Handling**:
- Existing photos shown in preview
- New photos uploaded
- Deleted photos removed from storage (TODO: implement cleanup)

---

## Review Deletion

### User Journey
1. Business clicks "Delete" on a review
2. Confirmation dialog appears
3. Confirms deletion
4. Review soft-deleted (`deleted_at` set)
5. Review hidden from all lists

### Frontend Implementation

**Component**: `src/components/review/ReviewDeleteDialog.tsx`
- Confirmation dialog with warning
- "Permanently Delete" button

**Deletion Logic**:
```typescript
await supabase
  .from('reviews')
  .update({ deleted_at: new Date().toISOString() })
  .eq('id', reviewId);
```

**Soft Delete**:
- Review NOT removed from database
- `deleted_at` timestamp set
- Queries filter: `WHERE deleted_at IS NULL`
- Can be restored by setting `deleted_at = null`

---

## Anonymous Reviews

### Purpose
Allow businesses to write reviews that customers can claim and respond to, but the review won't appear in the business's public review list.

### How It Works
1. Business writes review
2. Checks "Make this review anonymous" checkbox
3. Review saved with `is_anonymous: true`
4. Review does NOT appear on business's public profile
5. Customer can still find it via search
6. Customer can claim and respond
7. Business receives conversation notifications
8. Business can see conversation but review stays hidden from their public list

### Frontend Implementation

**Checkbox**: `src/components/reviews/ReviewForm.tsx`
- Simple checkbox: "Make this review anonymous"
- Stored in `formState.isAnonymous`

**Filtering**: Business dashboard queries
- Where business wants to show reviews: `WHERE is_anonymous = false`
- Where customer searches: No filter (show all)

### Database
**reviews** table:
- `is_anonymous` (boolean, nullable for backward compatibility)
- Default: `false`

### Edge Cases
- Anonymous reviews CAN be unlocked/claimed
- Anonymous reviews CAN have conversations
- Anonymous reviews are NOT visible on business profile page
- Anonymous reviews ARE visible in search results (customer's perspective)

---

## Review Photos

### Upload Process
1. User selects photos (max 5)
2. Client-side preview shown
3. On submit: Photos uploaded in parallel
4. Progress bar shows upload status
5. URLs saved to `review_photos` table

### Frontend Implementation

**Component**: `src/components/reviews/PhotoUpload.tsx`
- Drag-and-drop area
- File input (accept: image/*)
- Preview grid with remove buttons
- Max 5 photos enforced

**Upload Progress**: `src/components/reviews/UploadProgressDialog.tsx`
- Modal dialog showing upload progress
- Shows: "Uploading photo X of Y"
- Progress bar (0-100%)
- Auto-closes when complete

**Hook**: `src/hooks/useUploadProgress.ts`
- Manages upload state
- `startUpload(totalPhotos)` - Initialize
- `updateProgress(currentIndex, progress)` - Update bar
- `completeUpload()` - Finish
- `resetUpload()` - Cancel/error

### Photo Display

**Gallery**: `src/components/reviews/PhotoGallery.tsx`
- Grid layout
- Click to expand (lightbox)
- Swipe navigation on mobile

### Storage Details
- **Bucket**: `review-photos`
- **Max Size**: Configured in Supabase (typically 5-10 MB per file)
- **Allowed Types**: image/jpeg, image/png, image/webp, image/gif
- **Optimization**: Client-side resizing (TODO: implement)

---

## Associates Feature

### Purpose
Some reviews involve multiple people (e.g., roommates). Associates allow listing up to 3 additional names.

### Frontend Implementation

**Component**: `src/components/reviews/AssociatesInput.tsx`
- 3 name input pairs (first + last name)
- "Add Associate" button (disabled after 3)
- "Remove" button per associate

**State**: `formState.associates`
```typescript
[
  { firstName: "John", lastName: "Doe" },
  { firstName: "Jane", lastName: "Smith" }
]
```

**Submission**:
- Empty entries filtered out
- Max 3 associates enforced (line 88-91 in reviewSubmissionService.ts)
- Stored as JSONB array

### Database
**reviews.associates** (JSONB)
```json
[
  { "firstName": "John", "lastName": "Doe" },
  { "firstName": "Jane", "lastName": "Smith" }
]
```

### Search Integration
- When searching for "John Doe", checks associates array
- Results flagged with `isAssociateMatch: true`
- Shows "Match: Associate on review" badge

---

## Common Issues & Solutions

### Issue: Photos fail to upload
**Solution**: Retry upload, check file size, check network connection

### Issue: Duplicate review warning
**Solution**: Edit existing review instead of creating new

### Issue: Self-review detected
**Solution**: Cannot review your own business, use different account

### Issue: Content rejected (prohibited words)
**Solution**: Rephrase review to remove prohibited content

### Issue: Review not appearing
**Solution**: Check `deleted_at` field, ensure not soft-deleted
