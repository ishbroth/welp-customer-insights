-- Add 'conversation_response' to the allowed claim_type values
ALTER TABLE public.review_claims 
DROP CONSTRAINT review_claims_claim_type_check;

ALTER TABLE public.review_claims 
ADD CONSTRAINT review_claims_claim_type_check 
CHECK (claim_type = ANY (ARRAY['credit_unlock'::text, 'subscription_response'::text, 'direct_claim'::text, 'conversation_response'::text]));