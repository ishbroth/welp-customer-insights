-- Drop all dependent policies first
DROP POLICY IF EXISTS "Users can view review photos based on review access" ON public.review_photos;
DROP POLICY IF EXISTS "Enhanced profile visibility for business interactions" ON public.profiles;

-- Create simplified policies
CREATE POLICY "Business owners can view their review photos" ON public.review_photos
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.reviews r 
    WHERE r.id = review_photos.review_id 
    AND r.business_id = auth.uid()
  )
);

CREATE POLICY "Simplified profile visibility" ON public.profiles
FOR SELECT USING (
  (auth.uid() = id) OR 
  ((type = 'business'::text) AND (verified = true))
);

-- Now remove claim-related columns from reviews table
ALTER TABLE public.reviews 
DROP COLUMN IF EXISTS claimed_at,
DROP COLUMN IF EXISTS claimed_by,
DROP COLUMN IF EXISTS customer_id;