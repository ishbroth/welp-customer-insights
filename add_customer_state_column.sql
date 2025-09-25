-- Add customer_state column to reviews table
ALTER TABLE public.reviews
ADD COLUMN IF NOT EXISTS customer_state VARCHAR(2);

-- Add a comment to document the column
COMMENT ON COLUMN public.reviews.customer_state IS 'US state abbreviation for customer address (e.g., CA, TX, NY)';