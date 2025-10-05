-- Add is_anonymous column to reviews table for anonymous review functionality
ALTER TABLE reviews
ADD COLUMN is_anonymous BOOLEAN DEFAULT false NOT NULL;

-- Add comment explaining the column
COMMENT ON COLUMN reviews.is_anonymous IS 'Indicates if the review was submitted anonymously. When true, business name is replaced with business category/type in display.';

-- Create index for potential filtering by anonymous status
CREATE INDEX idx_reviews_is_anonymous ON reviews(is_anonymous);