
-- Create table for email verification codes
CREATE TABLE IF NOT EXISTS public.email_verification_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(email)
);

-- Add RLS policies
ALTER TABLE public.email_verification_codes ENABLE ROW LEVEL SECURITY;

-- Policy to allow the service role to manage verification codes
CREATE POLICY "Service role can manage verification codes" 
  ON public.email_verification_codes 
  FOR ALL 
  USING (true);
