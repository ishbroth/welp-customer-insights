-- Allow customers to view business profiles for reviews written about them
-- This enables customers to see which business wrote a review about them
CREATE POLICY "Customers can view business profiles that reviewed them"
ON public.profiles
FOR SELECT
USING (
  type IN ('business', 'admin') AND
  EXISTS (
    SELECT 1
    FROM public.reviews r
    WHERE r.business_id = profiles.id
  )
);
