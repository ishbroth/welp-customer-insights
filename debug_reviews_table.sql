-- Check the current structure of the reviews table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'reviews'
ORDER BY ordinal_position;

-- Check recent reviews to see what data is being saved
SELECT
  id,
  customer_name,
  customer_address,
  customer_city,
  customer_state,
  customer_zipcode,
  associates,
  created_at,
  updated_at
FROM reviews
WHERE customer_name ILIKE '%salvatore%' OR customer_name ILIKE '%sardina%'
ORDER BY updated_at DESC
LIMIT 5;