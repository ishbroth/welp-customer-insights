-- Allow businesses to view customer profiles for reviews they wrote that have been claimed
CREATE POLICY "Businesses can view customer profiles for their claimed reviews" 
ON public.profiles 
FOR SELECT 
USING (
  type = 'customer' AND 
  EXISTS (
    SELECT 1 
    FROM public.reviews r
    INNER JOIN public.review_claims rc ON r.id = rc.review_id
    WHERE r.business_id = auth.uid() 
    AND rc.claimed_by = profiles.id
  )
);