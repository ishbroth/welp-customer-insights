# Core Schema

The foundation of the review platform: user profiles, business information, reviews, responses, and photos.

## Tables in This Domain

1. `profiles` - User accounts (business owners and customers)
2. `business_info` - Business details and verification
3. `reviews` - Customer reviews
4. `responses` - Business responses to reviews
5. `review_photos` - Photos attached to reviews

---

## profiles

User accounts for both business owners and customers.

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | - | Primary key |
| email | text | YES | NULL | User's email address |
| first_name | text | YES | NULL | User's first name |
| last_name | text | YES | NULL | User's last name |
| name | text | YES | NULL | User's display name |
| avatar | text | YES | NULL | Avatar image URL |
| bio | text | YES | NULL | User biography |
| phone | text | YES | NULL | User's phone number |
| address | text | YES | NULL | Street address |
| city | text | YES | NULL | City |
| state | text | YES | NULL | US state |
| zipcode | text | YES | NULL | ZIP code |
| business_id | text | YES | NULL | Business identifier (if business user) |
| type | text | NO | 'customer' | User type: 'customer' or 'business' |
| created_at | timestamptz | NO | now() | Account creation timestamp (UTC) |
| updated_at | timestamptz | NO | now() | Last update timestamp (UTC) |
| verified | boolean | YES | false | Verification status |

### Constraints

- **Primary Key**: `id`
- **No foreign key to auth.users** - `id` is just a uuid, not a foreign key

### RLS

- **Enabled**: Yes
- **Policies**: Users can read/update their own profile

### Used In

- `src/pages/Profile.tsx` - Profile management
- `src/hooks/useProfile.ts` - Profile data access
- `src/components/auth/SignUpForm.tsx` - Registration
- `src/services/authService.ts` - Authentication

### Related Tables

- **Referenced by**: `business_info`, `reviews`, `customer_access`, `subscriptions`

---

## business_info

Business details and verification status.

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | - | Primary key, links to profiles.id |
| business_name | text | NO | - | Business name |
| license_number | text | YES | NULL | Business license number |
| license_type | text | YES | NULL | Type of license |
| license_expiration | date | YES | NULL | License expiration date |
| license_status | text | YES | NULL | License status |
| verified | boolean | NO | false | Verification status |
| business_category | text | YES | NULL | Business category |
| business_subcategory | text | YES | NULL | Business subcategory |
| license_state | text | YES | NULL | State license was issued |
| website | text | YES | NULL | Business website URL |
| additional_licenses | text | YES | NULL | Additional licenses |
| additional_info | text | YES | NULL | Additional information |

### Constraints

- **Primary Key**: `id`
- **Foreign Key**: `id` → `profiles(id)` ON DELETE CASCADE

### RLS

- **Enabled**: Yes
- **Policies**: Business owner can read/update their own record; authenticated users can read all business_info

### Used In

- `src/pages/BusinessProfile.tsx` - Business profile management
- `src/hooks/useBusinessInfo.ts` - Business data access
- `src/components/business/BusinessCard.tsx` - Display business info
- `src/pages/Home.tsx` - Business directory/search

### Related Tables

- **References**: `profiles(id)`
- **Referenced by**: `reviews(business_id)`

---

## reviews

Customer reviews of businesses.

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| business_id | uuid | YES | NULL | Business being reviewed (links to profiles) |
| rating | integer | NO | - | Star rating (1-5) |
| content | text | NO | - | Review text content |
| created_at | timestamptz | NO | now() | Review creation (UTC) |
| updated_at | timestamptz | NO | now() | Last update (UTC) |
| deleted_at | timestamptz | YES | NULL | Soft delete timestamp (UTC) |
| customer_phone | text | YES | NULL | Customer phone number |
| customer_name | text | YES | NULL | Customer name |
| customer_address | text | YES | NULL | Customer street address |
| customer_city | text | YES | NULL | Customer city |
| customer_state | varchar | YES | NULL | Customer US state abbreviation |
| customer_zipcode | text | YES | NULL | Customer ZIP code |
| customer_business_name | text | YES | NULL | Customer business name (if B2B) |
| customer_nickname | text | YES | NULL | Customer nickname for search |
| associates | jsonb | YES | '[]'::jsonb | Array of associate objects with firstName/lastName |
| is_anonymous | boolean | NO | false | Review submitted anonymously |

### Constraints

- **Primary Key**: `id`
- **Foreign Key**: `business_id` → `profiles(id)` ON DELETE SET NULL
- **Check**: `rating >= 1 AND rating <= 5` (implied by business logic)

### Indexes

- `business_id` (B-tree) - Fast lookup of reviews for a business
- `created_at` (B-tree) - Chronological ordering

### RLS

- **Enabled**: Yes
- **Policies**:
  - Authenticated users can create reviews
  - Business owners can read reviews about their business
  - Public reviews visible to authenticated users

### Used In

- `src/pages/NewReview.tsx` - Review submission
- `src/pages/BusinessProfile.tsx` - Display reviews for business
- `src/components/reviews/ReviewCard.tsx` - Review display
- `src/hooks/useReviewSubmission.ts` - Review creation
- `src/services/reviewSubmissionService.ts` - Review logic

### Related Tables

- **References**: `profiles(business_id)`
- **Referenced by**: `review_photos`, `responses`, `review_conversations`, `review_claims`, `review_reports`, `guest_access`, `conversation_participants`, `user_review_notifications`

---

## responses

Business responses to customer reviews.

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| review_id | uuid | YES | NULL | Review being responded to |
| author_id | uuid | YES | NULL | User who wrote response (links to auth.users) |
| content | text | NO | - | Response text |
| created_at | timestamptz | NO | now() | Response creation (UTC) |
| updated_at | timestamptz | NO | now() | Last update (UTC) |

### Constraints

- **Primary Key**: `id`
- **Foreign Key**: `review_id` → `reviews(id)` ON DELETE CASCADE
- **Foreign Key**: `author_id` → `auth.users(id)` ON DELETE CASCADE

### RLS

- **Enabled**: Yes
- **Policies**:
  - Business owners can create responses to reviews about their business
  - Anyone can read responses
  - Business owners can update/delete their own responses

### Used In

- `src/pages/ReviewResponse.tsx` - Create/edit response
- `src/components/reviews/ResponseCard.tsx` - Display response
- `src/hooks/useReviewResponse.ts` - Response logic
- `src/services/reviewResponseService.ts` - Response creation

### Access Control

Business must have:
- Active credits in `credits` table, OR
- Active subscription in `subscriptions` table

Before creating a response.

### Related Tables

- **References**: `reviews(id)`, `auth.users(author_id)`
- **Referenced by**: None

---

## review_photos

Photos attached to reviews.

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| review_id | uuid | NO | - | Review this photo belongs to |
| photo_url | text | NO | - | Supabase Storage URL |
| caption | text | YES | NULL | Photo caption |
| display_order | integer | NO | 0 | Display order for multiple photos |
| created_at | timestamptz | NO | now() | Upload timestamp (UTC) |

### Constraints

- **Primary Key**: `id`
- **Foreign Key**: `review_id` → `reviews(id)` ON DELETE CASCADE

### RLS

- **Enabled**: Yes
- **Policies**:
  - Review author can upload photos
  - Anyone can view photos for accessible reviews

### Storage

Photos stored in Supabase Storage bucket: `review-photos`

### Used In

- `src/components/reviews/PhotoUpload.tsx` - Photo upload UI
- `src/services/photoUploadService.ts` - Upload logic
- `src/components/reviews/ReviewCard.tsx` - Display photos
- `src/hooks/usePhotoUpload.ts` - Photo management

### Related Tables

- **References**: `reviews(id)`
- **Referenced by**: None

---

## Summary

**Total Tables**: 5

**Key Relationships**:
- `profiles` ← `business_info` (one-to-one)
- `profiles` ← `reviews` (one-to-many, business_id)
- `reviews` ← `responses` (one-to-many)
- `reviews` ← `review_photos` (one-to-many)

**Common Query Patterns**:
```sql
-- Get business with reviews
SELECT p.*, bi.*, r.*
FROM profiles p
JOIN business_info bi ON bi.id = p.id
LEFT JOIN reviews r ON r.business_id = p.id
WHERE p.id = '...';

-- Get review with response and photos
SELECT r.*, resp.*, p.*
FROM reviews r
LEFT JOIN responses resp ON resp.review_id = r.id
LEFT JOIN review_photos p ON p.review_id = r.id
WHERE r.id = '...';
```

See `constraints.md` for complete foreign key documentation.
