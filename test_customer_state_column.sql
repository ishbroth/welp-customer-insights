-- Test if customer_state column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'reviews'
  AND column_name = 'customer_state';