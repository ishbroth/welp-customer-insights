-- First, drop the dependent RLS policy on review_photos
DROP POLICY IF EXISTS "Users can view review photos based on review access" ON public.review_photos;

-- Create a new simplified policy for review photos (only business owners can see their review photos)
CREATE POLICY "Business owners can view their review photos" ON public.review_photos
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.reviews r 
    WHERE r.id = review_photos.review_id 
    AND r.business_id = auth.uid()
  )
);

-- Now remove response-related tables and columns
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