-- Remove response-related tables and columns
DROP TABLE IF EXISTS public.responses CASCADE;
DROP TABLE IF EXISTS public.review_claim_history CASCADE;

-- Remove claim-related columns from reviews table
ALTER TABLE public.reviews 
DROP COLUMN IF EXISTS claimed_at,
DROP COLUMN IF EXISTS claimed_by,
DROP COLUMN IF EXISTS customer_id;

-- Remove the consecutive response check trigger and function
DROP TRIGGER IF EXISTS check_consecutive_responses_trigger ON public.responses;
DROP FUNCTION IF EXISTS public.check_consecutive_responses();

-- Remove review deletion trigger since it was related to claiming
DROP TRIGGER IF EXISTS review_deletion_trigger ON public.reviews;
DROP FUNCTION IF EXISTS public.handle_review_deletion();

-- Remove auto-relink trigger since it was related to claiming
DROP TRIGGER IF EXISTS auto_relink_review_trigger ON public.reviews;
DROP FUNCTION IF EXISTS public.auto_relink_review();