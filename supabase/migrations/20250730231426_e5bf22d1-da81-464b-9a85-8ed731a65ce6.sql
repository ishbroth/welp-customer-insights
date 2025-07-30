-- Migration: Populate review_claims from existing credit_transactions (safe version)
-- Only migrate transactions where the review still exists

INSERT INTO review_claims (review_id, claimed_by, claim_type, claimed_at, credit_transaction_id)
SELECT 
  SUBSTRING(ct.description FROM 'Unlocked review ([a-f0-9-]{36})')::uuid as review_id,
  ct.user_id as claimed_by,
  'credit_unlock' as claim_type,
  ct.created_at as claimed_at,
  ct.id as credit_transaction_id
FROM credit_transactions ct
INNER JOIN reviews r ON SUBSTRING(ct.description FROM 'Unlocked review ([a-f0-9-]{36})')::uuid = r.id
WHERE ct.description LIKE 'Unlocked review %'
  AND SUBSTRING(ct.description FROM 'Unlocked review ([a-f0-9-]{36})') IS NOT NULL
ON CONFLICT (review_id) DO NOTHING;