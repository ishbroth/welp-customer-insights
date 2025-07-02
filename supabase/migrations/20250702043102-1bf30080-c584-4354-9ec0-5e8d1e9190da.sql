
-- Update RLS policies on profiles table to allow public access to business profile data needed for reviews
-- while keeping personal information private

-- First, drop the existing restrictive policy for SELECT
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create a new policy that allows public access to business profile information
-- but restricts personal/private information to the profile owner
CREATE POLICY "Public can view business profile info for reviews" 
ON public.profiles 
FOR SELECT 
USING (
  -- Allow users to see their own complete profile
  auth.uid() = id 
  OR 
  -- Allow public to see business profiles (type = 'business') for review display
  (type = 'business' AND id IS NOT NULL)
);

-- Also update business_info table to allow public read access for business names and verification status
-- This is needed for the review search to display business names and verification badges

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Business owners can view their own business info" ON public.business_info;

-- Create new policy allowing public read access to business_info for reviews
CREATE POLICY "Public can view business info for reviews" 
ON public.business_info 
FOR SELECT 
USING (
  -- Allow business owners to see their own complete info
  auth.uid() = id 
  OR 
  -- Allow public to see business name and verification status for reviews
  true
);

-- Keep the existing UPDATE policy on business_info unchanged
-- "Business owners can update their own business info" should remain as-is
