
-- Make phone column nullable in verification_codes table since email verification doesn't require phone
ALTER TABLE verification_codes ALTER COLUMN phone DROP NOT NULL;
