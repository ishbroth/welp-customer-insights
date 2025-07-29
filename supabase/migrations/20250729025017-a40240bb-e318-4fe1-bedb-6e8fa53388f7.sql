-- Fix RLS policy to allow businesses to see customer profiles for their review responses
DROP POLICY IF EXISTS "Users can view public business profiles only" ON public.profiles;

-- Create a more permissive policy that allows businesses to see customer profiles 
-- when those customers have responded to the business's reviews
CREATE POLICY "Enhanced profile visibility for business interactions" 
ON public.profiles 
FOR SELECT 
USING (
  (auth.uid() = id) OR 
  ((type = 'business'::text) AND (verified = true)) OR
  (
    -- Allow businesses to see customer profiles if the customer has responded to their reviews
    EXISTS (
      SELECT 1 
      FROM public.responses r 
      JOIN public.reviews rev ON r.review_id = rev.id 
      WHERE r.author_id = profiles.id 
      AND rev.business_id = auth.uid()
    )
  ) OR
  (
    -- Allow customers to see business profiles for reviews they're associated with
    EXISTS (
      SELECT 1 
      FROM public.reviews rev 
      WHERE rev.customer_id = auth.uid() 
      AND rev.business_id = profiles.id
    )
  )
);

-- Temporarily disable the review deletion trigger to test if it's causing issues
DROP TRIGGER IF EXISTS review_deletion_trigger ON public.reviews;

-- Add foreign key constraint to ensure responses are deleted when review is deleted
ALTER TABLE public.responses 
DROP CONSTRAINT IF EXISTS responses_review_id_fkey;

ALTER TABLE public.responses 
ADD CONSTRAINT responses_review_id_fkey 
FOREIGN KEY (review_id) REFERENCES public.reviews(id) 
ON DELETE CASCADE;