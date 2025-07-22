
-- First, let's modify the verification_codes table to support both phone and email verification
ALTER TABLE public.verification_codes 
ADD COLUMN email text,
ADD COLUMN verification_type text NOT NULL DEFAULT 'phone';

-- Add a check constraint to ensure we have either phone or email
ALTER TABLE public.verification_codes 
ADD CONSTRAINT verification_codes_contact_check 
CHECK (
  (phone IS NOT NULL AND email IS NULL AND verification_type = 'phone') OR
  (email IS NOT NULL AND phone IS NULL AND verification_type = 'email')
);

-- Update existing records to have verification_type set to 'phone'
UPDATE public.verification_codes SET verification_type = 'phone' WHERE verification_type IS NULL;

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_verification_codes_email_type ON public.verification_codes(email, verification_type);
