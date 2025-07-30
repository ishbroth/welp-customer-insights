-- Create global review claims table
CREATE TABLE public.review_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  claimed_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  claimed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  claim_type TEXT NOT NULL CHECK (claim_type IN ('credit_unlock', 'subscription_response', 'direct_claim')),
  credit_transaction_id UUID REFERENCES public.credit_transactions(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure one review can only be claimed once
  UNIQUE(review_id)
);

-- Enable RLS
ALTER TABLE public.review_claims ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view all claims for matching purposes" 
ON public.review_claims 
FOR SELECT 
USING (true);

CREATE POLICY "Users can claim reviews for themselves" 
ON public.review_claims 
FOR INSERT 
WITH CHECK (auth.uid() = claimed_by);

CREATE POLICY "Users can view their own claims" 
ON public.review_claims 
FOR SELECT 
USING (auth.uid() = claimed_by);

-- Index for performance
CREATE INDEX idx_review_claims_review_id ON public.review_claims(review_id);
CREATE INDEX idx_review_claims_claimed_by ON public.review_claims(claimed_by);

-- Function to claim a review (atomic operation)
CREATE OR REPLACE FUNCTION public.claim_review(
  p_review_id UUID,
  p_claimed_by UUID,
  p_claim_type TEXT,
  p_credit_transaction_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Try to insert the claim (will fail if already claimed due to unique constraint)
  INSERT INTO public.review_claims (review_id, claimed_by, claim_type, credit_transaction_id)
  VALUES (p_review_id, p_claimed_by, p_claim_type, p_credit_transaction_id);
  
  RETURN true;
EXCEPTION
  WHEN unique_violation THEN
    -- Review already claimed
    RETURN false;
END;
$$;