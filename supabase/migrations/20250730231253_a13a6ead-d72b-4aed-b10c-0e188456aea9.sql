-- Migration: Populate review_claims from existing credit_transactions
-- This migration extracts review unlock data from credit_transactions and populates the review_claims table

INSERT INTO review_claims (review_id, claimed_by, claim_type, claimed_at, credit_transaction_id)
SELECT 
  SUBSTRING(description FROM 'Unlocked review ([a-f0-9-]{36})')::uuid as review_id,
  user_id as claimed_by,
  'credit_unlock' as claim_type,
  created_at as claimed_at,
  id as credit_transaction_id
FROM credit_transactions 
WHERE description LIKE 'Unlocked review %'
  AND SUBSTRING(description FROM 'Unlocked review ([a-f0-9-]{36})') IS NOT NULL
ON CONFLICT (review_id) DO NOTHING;