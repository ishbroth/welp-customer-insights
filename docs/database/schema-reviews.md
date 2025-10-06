# Reviews Schema

Review management, claims, reports, and customer associations.

## Tables in This Domain

1. `review_claims` - Business claims on reviews
2. `review_claim_history` - Claim data snapshot history
3. `review_reports` - Reported/flagged reviews
4. `customer_review_associations` - Customer-review links

---

## review_claims

Business claims on reviews for accessing customer contact information.

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| review_id | uuid | NO | - | Review being claimed (unique) |
| claimed_by | uuid | NO | - | User claiming review (links to auth.users) |
| claim_type | text | NO | - | Type of claim |
| credit_transaction_id | uuid | YES | NULL | Associated credit transaction |
| claimed_at | timestamptz | NO | now() | When claim submitted (UTC) |
| created_at | timestamptz | NO | now() | Record creation (UTC) |

### Constraints

- **Primary Key**: `id`
- **Foreign Key**: `review_id` → `reviews(id)` ON DELETE CASCADE
- **Foreign Key**: `claimed_by` → `auth.users(id)` ON DELETE CASCADE
- **Foreign Key**: `credit_transaction_id` → `credit_transactions(id)` ON DELETE SET NULL
- **Unique**: `review_id` (one claim per review)
- **Check**: `claim_type IN ('credit_unlock', 'subscription_response', 'direct_claim', 'conversation_response')`

### Indexes

- `review_id` (B-tree) - Lookup claims for review
- `claimed_by` (B-tree) - Lookup claims by user

### RLS

- **Enabled**: Yes
- **Policies**:
  - Business owners can create claims for reviews about their business
  - Business owners can read their own claims

### Used In

- Review access and response features
- Credit system integration

### Claim Types

- `credit_unlock` - Claimed using credits
- `subscription_response` - Claimed via active subscription
- `direct_claim` - Direct claim
- `conversation_response` - Claimed for conversation

### Related Tables

- **References**: `reviews(review_id)`, `auth.users(claimed_by)`, `credit_transactions(credit_transaction_id)`
- **Referenced by**: None

---

## review_claim_history

Historical snapshot of customer data when review was claimed (for data retention, not audit trail).

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| original_review_id | uuid | YES | NULL | Original review ID |
| customer_id | uuid | NO | - | Customer ID at time of claim |
| business_id | uuid | NO | - | Business ID at time of claim |
| customer_name | text | YES | NULL | Customer name snapshot |
| customer_phone | text | YES | NULL | Customer phone snapshot |
| customer_address | text | YES | NULL | Customer address snapshot |
| customer_city | text | YES | NULL | Customer city snapshot |
| customer_zipcode | text | YES | NULL | Customer ZIP snapshot |
| claimed_at | timestamptz | NO | now() | When claim occurred (UTC) |
| broken_at | timestamptz | YES | NULL | When link was broken (UTC) |
| created_at | timestamptz | NO | now() | Record creation (UTC) |

### Constraints

- **Primary Key**: `id`

### Purpose

This table stores a snapshot of customer data at the time a review was claimed. It serves as a data retention mechanism, not an audit trail. When the original review is deleted or the customer-review relationship changes, this table preserves the historical claim information.

### RLS

- **Enabled**: Yes
- **Policies**: Business owners can read snapshots for their claims

### Used In

- Data retention for claimed reviews
- Historical customer contact information

### Related Tables

- **References**: None (standalone snapshot table)
- **Referenced by**: None

---

## review_reports

Reported/flagged reviews for moderation.

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| review_id | uuid | NO | - | Review being reported |
| reporter_id | uuid | NO | - | User who reported |
| reporter_name | text | YES | NULL | Reporter name |
| reporter_email | text | YES | NULL | Reporter email |
| reporter_phone | text | YES | NULL | Reporter phone |
| complaint | text | YES | NULL | Complaint details |
| is_about_reporter | boolean | NO | false | Report is about the reporter themselves |
| status | text | NO | 'pending' | Report status |
| processed_at | timestamptz | YES | NULL | When processed (UTC) |
| created_at | timestamptz | NO | now() | Report creation (UTC) |

### Constraints

- **Primary Key**: `id`
- **Foreign Key**: `review_id` → `reviews(id)` ON DELETE CASCADE

### Indexes

- `review_id` (B-tree) - Lookup reports for review
- `status` (B-tree) - Filter pending reports

### RLS

- **Enabled**: Yes
- **Policies**:
  - Authenticated users can create reports
  - Users can read their own reports
  - Admins can read/update all reports

### Used In

- Review moderation
- Content reporting

### Report Statuses

- `pending` - Report awaiting review
- Other statuses managed by moderation system

### Related Tables

- **References**: `reviews(review_id)`
- **Referenced by**: None

---

## customer_review_associations

Links customers to reviews for tracking purposes.

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| customer_id | uuid | NO | - | Customer who wrote review |
| review_id | uuid | NO | - | Review that was written |
| association_type | text | NO | - | Type of association |
| created_at | timestamptz | NO | now() | Association creation (UTC) |

### Constraints

- **Primary Key**: `id`
- **Check**: `association_type IN ('purchased', 'responded')`

### Indexes

- `customer_id` (B-tree) - Lookup reviews by customer
- `review_id` (B-tree) - Lookup customer for review

### RLS

- **Enabled**: Yes
- **Policies**:
  - Users can read their own associations
  - Service role can create associations

### Association Types

- `purchased` - Customer purchased access to review
- `responded` - Customer responded to review

### Used In

- Review access tracking
- Customer review history

### Related Tables

- **References**: None (standalone tracking table)
- **Referenced by**: None

---

## Summary

**Total Tables**: 4

**Key Relationships**:
- `reviews` ← `review_claims.review_id` (one-to-one)
- `auth.users` ← `review_claims.claimed_by` (one-to-many)
- `credit_transactions` ← `review_claims.credit_transaction_id` (one-to-one, optional)
- `reviews` ← `review_reports.review_id` (one-to-many)

**Review Management Flow**:

**Claiming a Review**:
1. Business discovers review about them
2. Business claims review using credits or subscription
3. Insert into `review_claims`
4. Create snapshot in `review_claim_history`
5. Business gains access to customer contact info

**Reporting a Review**:
1. User sees inappropriate review
2. User submits report → `review_reports` (status = 'pending')
3. Admin reviews report
4. Admin processes report
5. Update `review_reports.status`

**Customer Association**:
1. Customer interacts with review
2. Create association in `customer_review_associations`
3. Track association type

**Common Query Patterns**:
```sql
-- Check if review is claimed
SELECT * FROM review_claims
WHERE review_id = '...';

-- Get pending reports
SELECT * FROM review_reports
WHERE status = 'pending'
ORDER BY created_at DESC;

-- Get claim history
SELECT * FROM review_claim_history
WHERE business_id = '...'
ORDER BY claimed_at DESC;
```

See `constraints.md` for complete foreign key documentation.
