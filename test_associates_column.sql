-- Test script to verify associates column functionality
-- Run this AFTER applying the migration

-- Test 1: Insert a test review with associates
INSERT INTO public.reviews (
  content,
  rating,
  customer_name,
  associates,
  business_id
) VALUES (
  'Test review with associates',
  4,
  'Test Customer',
  '[{"firstName": "John", "lastName": "Smith"}, {"firstName": "Jane", "lastName": "Doe"}]'::jsonb,
  (SELECT id FROM profiles WHERE type = 'business' LIMIT 1)
);

-- Test 2: Query reviews with associates
SELECT id, customer_name, associates
FROM public.reviews
WHERE associates != '[]'::jsonb
LIMIT 5;

-- Test 3: Update associates on existing review
UPDATE public.reviews
SET associates = '[{"firstName": "Updated", "lastName": "Associate"}]'::jsonb
WHERE content = 'Test review with associates';

-- Test 4: Query specific associate data
SELECT
  id,
  customer_name,
  jsonb_array_length(associates) as associates_count,
  associates->0->>'firstName' as first_associate_firstname,
  associates->0->>'lastName' as first_associate_lastname
FROM public.reviews
WHERE associates != '[]'::jsonb;

-- Cleanup test data
DELETE FROM public.reviews WHERE content = 'Test review with associates';