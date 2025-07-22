
-- Add unique constraint to verification_codes table for email and verification_type
ALTER TABLE verification_codes 
ADD CONSTRAINT verification_codes_email_verification_type_key 
UNIQUE (email, verification_type);
