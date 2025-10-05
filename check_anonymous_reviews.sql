SELECT
  r.id,
  r.customer_name,
  r.content,
  r.is_anonymous,
  r.created_at,
  p.name as business_name,
  p.business_name as profile_business_name
FROM reviews r
JOIN profiles p ON r.business_id = p.id
WHERE LOWER(p.name) LIKE '%painted painter%'
   OR LOWER(p.business_name) LIKE '%painted painter%'
ORDER BY r.created_at DESC
LIMIT 10;
