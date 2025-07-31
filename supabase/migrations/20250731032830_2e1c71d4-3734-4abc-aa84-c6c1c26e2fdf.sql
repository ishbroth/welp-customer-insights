-- Also allow businesses to view customer profiles when customers have responded to their reviews
CREATE POLICY "Businesses can view customer profiles for conversation participants" 
ON public.profiles 
FOR SELECT 
USING (
  type = 'customer' AND 
  EXISTS (
    SELECT 1 
    FROM public.reviews r
    INNER JOIN public.conversation_participants cp ON r.id = cp.review_id
    WHERE r.business_id = auth.uid() 
    AND cp.customer_id = profiles.id
  )
);