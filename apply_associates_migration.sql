-- Manual migration to add associates column to reviews table
-- Run this in your Supabase SQL Editor

-- Add associates column to reviews table
ALTER TABLE public.reviews
ADD COLUMN IF NOT EXISTS associates JSONB DEFAULT '[]'::jsonb;

-- Add a comment to describe the column
COMMENT ON COLUMN public.reviews.associates IS 'Array of associate objects containing firstName and lastName fields';

-- Create an index on the associates column for better query performance
CREATE INDEX IF NOT EXISTS idx_reviews_associates ON public.reviews USING GIN (associates);

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'reviews' AND column_name = 'associates';