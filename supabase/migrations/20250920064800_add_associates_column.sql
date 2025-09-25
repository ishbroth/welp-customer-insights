-- Add associates column to reviews table
-- This column will store an array of associate objects with firstName and lastName

ALTER TABLE public.reviews
ADD COLUMN associates JSONB DEFAULT '[]'::jsonb;

-- Add a comment to describe the column
COMMENT ON COLUMN public.reviews.associates IS 'Array of associate objects containing firstName and lastName fields';

-- Create an index on the associates column for better query performance
CREATE INDEX IF NOT EXISTS idx_reviews_associates ON public.reviews USING GIN (associates);