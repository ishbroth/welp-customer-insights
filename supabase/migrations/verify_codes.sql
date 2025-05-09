
-- Create table for storing verification codes
CREATE TABLE IF NOT EXISTS public.verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Ensure code expires after creation
  CONSTRAINT expires_after_creation CHECK (expires_at > created_at)
);

-- Add index for fast lookups by phone number
CREATE INDEX IF NOT EXISTS verification_codes_phone_idx ON public.verification_codes (phone);

-- Create a function to automatically clean up expired codes
CREATE OR REPLACE FUNCTION clean_expired_verification_codes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.verification_codes WHERE expires_at < NOW();
  RETURN NULL;
END;
$$;

-- Create a trigger to run the cleanup function periodically
DROP TRIGGER IF EXISTS trigger_clean_expired_verification_codes ON public.verification_codes;
CREATE TRIGGER trigger_clean_expired_verification_codes
  AFTER INSERT ON public.verification_codes
  EXECUTE PROCEDURE clean_expired_verification_codes();

-- Set up RLS
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

-- Only backend functions should access this table
CREATE POLICY "No direct access to verification_codes"
  ON public.verification_codes
  FOR ALL
  USING (false);
