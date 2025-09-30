-- Add customer_business_name column to reviews table
ALTER TABLE reviews
ADD COLUMN customer_business_name TEXT;

-- Add comment for documentation
COMMENT ON COLUMN reviews.customer_business_name IS 'Optional business name for customers who are also businesses, searchable field';