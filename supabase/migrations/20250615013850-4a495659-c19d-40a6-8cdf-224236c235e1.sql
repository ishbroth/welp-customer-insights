
-- Add verified field to profiles table for customer accounts
ALTER TABLE public.profiles 
ADD COLUMN verified BOOLEAN DEFAULT false;

-- Update existing customer profiles to be unverified by default
UPDATE public.profiles 
SET verified = false 
WHERE type = 'customer';

-- Create an index on verified field for better search performance
CREATE INDEX idx_profiles_verified ON public.profiles(verified);
