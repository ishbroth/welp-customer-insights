
-- Update the password for the specific user account
-- First, we need to find the user ID and then update their password
UPDATE auth.users 
SET 
  encrypted_password = crypt('I$h42069!', gen_salt('bf')),
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  updated_at = now()
WHERE email = 'iw@sdcarealty.com';
