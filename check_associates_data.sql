-- Check current associates data in the database
SELECT
  id,
  customer_name,
  rating,
  content,
  associates,
  created_at,
  updated_at
FROM reviews
WHERE associates IS NOT NULL
  AND associates != '[]'::jsonb
  AND deleted_at IS NULL
ORDER BY updated_at DESC
LIMIT 10;

-- Count reviews with associates data
SELECT COUNT(*) as reviews_with_associates
FROM reviews
WHERE associates IS NOT NULL
  AND associates != '[]'::jsonb
  AND deleted_at IS NULL;

-- Check for any reviews with more than 3 associates
SELECT
  id,
  customer_name,
  jsonb_array_length(associates) as associates_count,
  associates
FROM reviews
WHERE jsonb_array_length(associates) > 3
  AND deleted_at IS NULL;