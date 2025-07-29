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

-- Remove claim-related columns from reviews table if they exist
ALTER TABLE public.reviews 
DROP COLUMN IF EXISTS claimed_at,
DROP COLUMN IF EXISTS claimed_by,
DROP COLUMN IF EXISTS customer_id;