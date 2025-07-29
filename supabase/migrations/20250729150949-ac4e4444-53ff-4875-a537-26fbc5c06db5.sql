-- Migration to create missing customer_review_associations for previously unlocked reviews
-- This fixes the issue where reviews unlocked via credits don't appear in "Your Reviews"

INSERT INTO public.customer_review_associations (customer_id, review_id, association_type)
SELECT DISTINCT 
  ct.user_id as customer_id,
  substring(ct.description from 'Unlocked review (.+)')::uuid as review_id,
  'purchased' as association_type
FROM public.credit_transactions ct
WHERE ct.type = 'usage' 
  AND ct.description LIKE 'Unlocked review %'
  AND substring(ct.description from 'Unlocked review (.+)') IS NOT NULL
  AND substring(ct.description from 'Unlocked review (.+)') ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  AND NOT EXISTS (
    -- Only insert if association doesn't already exist
    SELECT 1 FROM public.customer_review_associations cra 
    WHERE cra.customer_id = ct.user_id 
    AND cra.review_id = substring(ct.description from 'Unlocked review (.+)')::uuid
  );