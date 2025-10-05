-- Add is_anonymous column to reviews table for anonymous review functionality
-- Run this SQL script directly on your Supabase database

-- Add the column with a conditional check
ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT false NOT NULL;

-- Add comment explaining the column
COMMENT ON COLUMN reviews.is_anonymous IS 'Indicates if the review was submitted anonymously. When true, business name is replaced with business category/type in display.';

-- Create index for potential filtering by anonymous status
CREATE INDEX IF NOT EXISTS idx_reviews_is_anonymous ON reviews(is_anonymous);