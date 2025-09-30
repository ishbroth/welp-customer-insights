-- Add customer_nickname column to reviews table
ALTER TABLE reviews
ADD COLUMN customer_nickname TEXT;

-- Add comment for documentation
COMMENT ON COLUMN reviews.customer_nickname IS 'Optional nickname for customer to improve search findability (e.g., "Sal" for "Salvatore")';