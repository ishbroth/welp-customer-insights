-- Add performance indexes for profile reviews queries
-- This migration adds missing indexes to speed up review fetching for customer profiles

-- Enable pg_trgm extension for fuzzy text matching (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Indexes for review_claims table (used to filter claimed reviews)
CREATE INDEX IF NOT EXISTS idx_review_claims_claimed_by
  ON public.review_claims(claimed_by);

CREATE INDEX IF NOT EXISTS idx_review_claims_review_id
  ON public.review_claims(review_id);

-- Index for reviews.business_id (used for JOIN with profiles table)
CREATE INDEX IF NOT EXISTS idx_reviews_business_id
  ON public.reviews(business_id);

-- Trigram indexes for fuzzy matching on customer names and addresses
-- These significantly speed up similarity searches like: similarity(customer_name, 'John Doe') > 0.7
CREATE INDEX IF NOT EXISTS idx_reviews_customer_name_trgm
  ON public.reviews USING gin(customer_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_reviews_customer_address_trgm
  ON public.reviews USING gin(customer_address gin_trgm_ops);

-- Composite index for filtering unclaimed reviews by creation date
-- Useful for queries that need recent unclaimed reviews
CREATE INDEX IF NOT EXISTS idx_reviews_created_at_desc
  ON public.reviews(created_at DESC);

-- Comment explaining the indexes
COMMENT ON INDEX idx_review_claims_claimed_by IS 'Speeds up queries filtering reviews by claimed_by user';
COMMENT ON INDEX idx_review_claims_review_id IS 'Speeds up JOIN operations between reviews and review_claims';
COMMENT ON INDEX idx_reviews_business_id IS 'Speeds up JOIN operations with profiles table for business info';
COMMENT ON INDEX idx_reviews_customer_name_trgm IS 'Enables fast fuzzy matching on customer names using trigram similarity';
COMMENT ON INDEX idx_reviews_customer_address_trgm IS 'Enables fast fuzzy matching on customer addresses using trigram similarity';
COMMENT ON INDEX idx_reviews_created_at_desc IS 'Speeds up sorting reviews by creation date (most recent first)';
