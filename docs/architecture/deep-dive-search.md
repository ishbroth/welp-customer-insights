# Deep Dive: Customer Search System

## Overview
The search system allows businesses to find customers by name, phone, address, or business name. Results come from two sources:
1. **Profile Search**: Existing customer profiles
2. **Review Search**: Customer info embedded in reviews

Results are merged, deduplicated, and ranked by relevance.

---

## Search Flow

### User Journey
1. Business navigates to `/search`
2. Enters search criteria:
   - First name, last name
   - Phone number
   - Address, city, state, zipcode
   - Business name (for customers who own businesses)
3. Clicks "Search" or types (auto-submits)
4. Results appear showing customer cards
5. Each card shows:
   - Customer name, contact info
   - Reviews about this customer (if unlocked)
   - Match quality score
   - Actions: View profile, unlock reviews

### Frontend Implementation

**Page**: `src/pages/SearchResults.tsx`
- Search form at top
- Results list below
- Uses `useCustomerSearch` hook
- Loading state while searching
- Empty state if no results

**Search Form**: `src/components/search/SearchField.tsx`
- Input fields for all search criteria
- Updates URL query params on change
- Debounced to prevent excessive searches (300ms)

**Hook**: `src/hooks/useCustomerSearch.ts` (211 lines - complex logic)

#### Search Process (line 40-176)

**1. Extract Search Parameters** (line 27-38):
```typescript
const searchParameters = {
  lastName: searchParams.get("lastName") || "",
  firstName: searchParams.get("firstName") || "",
  businessName: searchParams.get("businessName") || "",
  phone: searchParams.get("phone") || "",
  address: searchParams.get("address") || "",
  city: searchParams.get("city") || "",
  state: searchParams.get("state") || "",
  zipCode: searchParams.get("zipCode") || "",
  fuzzyMatch: searchParams.get("fuzzyMatch") === "true",
  similarityThreshold: parseFloat(searchParams.get("similarityThreshold") || "0.7")
};
```

**2. Check Cache** (line 43-50):
- 5-minute TTL cache
- Key: JSON.stringify(searchParameters)
- Skip API if cached

**3. Validate Parameters** (line 53-65):
- Require at least one search field
- Return empty if no criteria

**4. Execute Parallel Searches** (line 70-75):
```typescript
const [profilesData, reviewsData] = await Promise.all([
  searchProfiles(searchParameters),
  searchReviews(searchParameters, unlockedReviews)
]);
```

**5. Process Results** (line 77-111):
- Convert profiles to Customer objects
- Convert reviews to Customer objects
- Group reviews by customer (same name/phone)

**6. Merge & Deduplicate** (line 114-138):
- Combine profile and review customers
- Match by name OR phone
- Merge reviews into single customer object

**7. Sort Results** (line 142-149):
- Prioritize customers with reviews by current user
- Secondary sort by name

**8. Cache Results** (line 154-162):
- Store in cache map
- Clean up old cache entries

#### Profile Search

**File**: `src/hooks/useCustomerSearch/profileSearch.ts`
- Searches `profiles` table
- Filters:
  ```sql
  WHERE type = 'customer'
    AND (
      first_name ILIKE '%{firstName}%' OR
      last_name ILIKE '%{lastName}%' OR
      phone ILIKE '%{phone}%' OR
      address ILIKE '%{address}%' OR
      city ILIKE '%{city}%' OR
      state = '{state}' OR
      zipcode = '{zipCode}'
    )
  ```
- Uses PostgreSQL `ILIKE` for case-insensitive matching
- Returns: Array of profile records

#### Review Search

**File**: `src/hooks/useCustomerSearch/reviewSearch.ts`
- Searches `reviews` table
- Filters:
  ```sql
  WHERE (
    customer_name ILIKE '%{firstName} {lastName}%' OR
    customer_phone ILIKE '%{phone}%' OR
    customer_address ILIKE '%{address}%' OR
    customer_city ILIKE '%{city}%' OR
    customer_zipcode = '{zipCode}' OR
    customer_business_name ILIKE '%{businessName}%'
  )
  AND business_id = {currentUserId} OR id IN ({unlockedReviews})
  ```
- **Access Control**: Only returns reviews business has unlocked
- **Associate Matching**: Also searches `associates` JSONB array
- Returns: Array of review records with business profile data

#### Customer Grouping

**File**: `src/hooks/useCustomerSearch/customerProcessor.ts`
- `processReviewCustomers(reviews)` function:
  1. Group reviews by customer identifier (name + phone)
  2. Create Customer object for each unique customer
  3. Attach all reviews for that customer
  4. Calculate match quality score

**Customer Object Structure**:
```typescript
{
  id: string, // Composite ID or profile ID
  firstName: string,
  lastName: string,
  phone: string,
  address: string,
  city: string,
  state: string,
  zipCode: string,
  businessName: string,
  reviews: Review[],
  matchScore: number,
  source: 'profile' | 'review' | 'both'
}
```

### Backend Implementation

**Direct Database Queries** (no edge function)
- Searches executed via Supabase client
- RLS policies enforce access control
- Queries optimized with indexes

**RLS Policy** (reviews table):
```sql
CREATE POLICY "businesses_see_unlocked_reviews" ON reviews
FOR SELECT USING (
  business_id = auth.uid() OR
  id IN (
    SELECT review_id FROM review_claims WHERE claimed_by = auth.uid()
  )
);
```

---

## Search Results Display

### Customer Card

**Component**: `src/components/search/CustomerCard.tsx`
- Expandable card showing customer info
- Click to expand full details
- Shows:
  - Name, phone, address
  - Number of reviews
  - Match quality indicator
  - Actions: View full profile, unlock reviews

**Match Quality Score**:
- Calculated based on field matches
- Higher score = more fields matched
- Component: `src/components/search/ReviewMatchQualityScore.tsx`
- Color-coded: Green (high), Yellow (medium), Red (low)

### Review Display (Inside Customer Card)

**Component**: `src/components/search/ReviewCard.tsx`
- Shows review preview if locked
- Shows full review if unlocked
- Actions:
  - Unlock (costs 1 credit)
  - Respond (starts conversation, free claim)
  - View conversation (if active)

**Locked Review**:
- Shows: Rating, date, photo count
- Hides: Content, customer details
- "Unlock to view full review" button

**Unlocked Review**:
- Shows: Full content, customer info, photos
- "Respond" button (if no conversation)
- Conversation thread (if exists)

---

## Associate Matching

### How It Works
Reviews can have up to 3 associates (other people involved). Search checks if query matches any associate.

### Implementation

**Database Query**:
```sql
SELECT * FROM reviews
WHERE associates @> '[{"firstName": "John", "lastName": "Doe"}]'::jsonb
```

**Result Flagging**:
```typescript
{
  ...review,
  isAssociateMatch: true,
  associateData: { firstName: "John", lastName: "Doe" },
  original_customer_name: "Jane Smith" // Main customer on review
}
```

**Display**:
- Badge: "Match: Associate on review"
- Shows: "Review about [original_customer_name], matched on associate [associateData]"

---

## Fuzzy Matching (Optional Feature)

### Purpose
Find partial matches when exact search doesn't return results.

### Implementation (if enabled)

**PostgreSQL Extension**: `pg_trgm` (trigram matching)
```sql
CREATE EXTENSION pg_trgm;

SELECT * FROM profiles
WHERE similarity(first_name, 'Jhon') > 0.7; -- Matches "John"
```

**Frontend Toggle**:
- Checkbox: "Enable fuzzy matching"
- Slider: Similarity threshold (0.5 - 1.0)

**Usage**:
```typescript
if (fuzzyMatch) {
  query = query.or(`first_name.ilike.%${firstName}%`);
  query = query.or(`similarity(first_name, ${firstName}).gt.${similarityThreshold}`);
}
```

---

## Search Performance

### Caching
- **Client-side**: 5-minute TTL cache in `searchCache` Map
- **Key**: Serialized search parameters
- **Benefit**: Instant results for repeated searches

### Debouncing
- 300ms delay after last keystroke
- Prevents excessive API calls
- Implementation: `debounceTimer` ref (line 194-202)

### Indexes
```sql
CREATE INDEX idx_profiles_first_name ON profiles(first_name);
CREATE INDEX idx_profiles_last_name ON profiles(last_name);
CREATE INDEX idx_profiles_phone ON profiles(phone);
CREATE INDEX idx_reviews_customer_name ON reviews(customer_name);
CREATE INDEX idx_reviews_customer_phone ON reviews(customer_phone);
CREATE INDEX idx_reviews_associates ON reviews USING gin(associates);
```

### Query Optimization
- Parallel profile + review searches
- Limited result sets (configurable)
- Selective field loading

---

## Search Filters & Sorting

### Available Filters (Future Enhancement)
- Date range (reviews created between X and Y)
- Rating filter (only 1-2 star reviews)
- Review status (with/without response)
- Claimed vs unclaimed

### Sorting Options
1. **Relevance** (default): Match score + user's own reviews first
2. **Name**: Alphabetical by last name
3. **Recent**: Most recently reviewed customers first
4. **Rating**: Lowest rated customers first (problem customers)

---

## Advanced Search Features

### Business Name Search
- Searches `customer_business_name` field in reviews
- Useful for finding customers who own businesses
- Example: Search for "Joe's Plumbing" to find Joe

### Phone Number Matching
- Strips all non-numeric characters
- Matches on digits only
- Handles different formats: (555) 123-4567, 555-123-4567, 5551234567

### Address Normalization
- Case-insensitive matching
- Partial address matching (street, apt, etc.)
- Handles abbreviations (St vs Street, Ave vs Avenue)

---

## Empty States

### No Results
**Component**: `src/components/search/EmptySearchResults.tsx`
- Message: "No customers found matching your search"
- Suggestions:
  - Try broader search criteria
  - Check spelling
  - Enable fuzzy matching

### No Search Criteria
- Message: "Enter search criteria to find customers"
- Shows example searches

---

## Access Control

### Review Visibility
- **Own Reviews**: Always visible (business_id = currentUser.id)
- **Claimed Reviews**: Visible after claiming (review_claims table)
- **Unclaimed Reviews**: Preview only

### Profile Visibility
- All customer profiles visible to all businesses
- Contact info always shown (for business purposes)
- No PII restrictions (business use case)

### RLS Enforcement
```sql
-- Profiles: All businesses can view customer profiles
CREATE POLICY "businesses_view_customers" ON profiles
FOR SELECT USING (
  type = 'customer' OR auth.uid() = id
);

-- Reviews: Businesses see reviews they wrote or unlocked
CREATE POLICY "businesses_view_reviews" ON reviews
FOR SELECT USING (
  business_id = auth.uid() OR
  id IN (SELECT review_id FROM review_claims WHERE claimed_by = auth.uid())
);
```

---

## Search Analytics (Future)

### Track Search Queries
```sql
CREATE TABLE search_queries (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  query_params JSONB,
  results_count INTEGER,
  searched_at TIMESTAMP
);
```

### Popular Searches
- Most common search terms
- Zero-result searches (improve matching)
- Average results per search

---

## Mobile Optimizations

### Responsive Design
- Single column layout on mobile
- Larger touch targets
- Simplified filter UI

### Performance
- Reduced initial load (fewer results)
- Lazy load customer cards
- Virtual scrolling for large result sets

### Mobile-Specific Features
- Pull-to-refresh
- Swipe actions on cards
- Bottom sheet for filters

---

## Common Search Patterns

### Find Customer by Phone
1. Enter phone number only
2. All other fields empty
3. Returns: All customers with matching phone

### Find All Customers in City
1. Enter city name
2. State (optional for disambiguation)
3. Returns: All customers in that city

### Find Recent Problem Customers
1. Date range: Last 30 days
2. Rating filter: 1-2 stars
3. Sort by: Most recent
4. Returns: Recently reviewed low-rated customers

### Find Customer by Multiple Criteria
1. Partial name + city
2. Returns: Customers matching both
3. Higher match score for more field matches

---

## Database Schema

### Search Result Types

**Customer (from profile)**:
```typescript
{
  id: UUID,
  firstName: string,
  lastName: string,
  phone: string,
  address: string,
  city: string,
  state: string,
  zipCode: string,
  reviews: [], // Empty if no reviews unlocked
  source: 'profile'
}
```

**Customer (from reviews)**:
```typescript
{
  id: 'composite-id', // Generated from review data
  firstName: string,
  lastName: string,
  phone: string,
  address: string,
  city: string,
  state: string,
  zipCode: string,
  businessName?: string,
  reviews: Review[],
  source: 'review'
}
```

**Review**:
```typescript
{
  id: UUID,
  rating: number,
  content: string,
  created_at: string,
  business_id: UUID,
  reviewerName: string,
  reviewerAvatar: string,
  reviewerVerified: boolean,
  isAssociateMatch?: boolean,
  associateData?: { firstName, lastName },
  original_customer_name?: string
}
```

---

## Common Issues & Solutions

### Issue: No results for valid customer
**Solution**: Check spelling, try fuzzy matching, search by phone instead

### Issue: Too many results (irrelevant)
**Solution**: Add more criteria (city, state), use exact name

### Issue: Results show locked reviews
**Solution**: Expected - previews shown, unlock to view full content

### Issue: Duplicate customers in results
**Solution**: Should be deduplicated by hook, check merging logic

### Issue: Associate matches not showing
**Solution**: Verify associates array in reviews table, check JSONB query
