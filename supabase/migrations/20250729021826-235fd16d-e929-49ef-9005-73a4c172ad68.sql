-- Step 1: Clean up duplicate consecutive responses from Isaac Wiley
-- Get the duplicate response IDs (keeping only the first one)
WITH consecutive_responses AS (
  SELECT 
    id,
    review_id,
    author_id,
    created_at,
    ROW_NUMBER() OVER (
      PARTITION BY review_id, author_id 
      ORDER BY created_at
    ) as row_num
  FROM public.responses 
  WHERE review_id IN (
    SELECT review_id 
    FROM public.responses 
    GROUP BY review_id, author_id 
    HAVING COUNT(*) > 1
  )
)
DELETE FROM public.responses 
WHERE id IN (
  SELECT id 
  FROM consecutive_responses 
  WHERE row_num > 1
);

-- Step 2: Add the trigger for consecutive response prevention
-- First check if trigger already exists and drop it
DROP TRIGGER IF EXISTS prevent_consecutive_responses ON public.responses;

-- Create the trigger
CREATE TRIGGER prevent_consecutive_responses
  BEFORE INSERT ON public.responses
  FOR EACH ROW
  EXECUTE FUNCTION public.check_consecutive_responses();

-- Step 3: Add foreign key constraint with cascade deletion for responses
-- Add foreign key constraint that will cascade delete responses when review is deleted
ALTER TABLE public.responses 
DROP CONSTRAINT IF EXISTS responses_review_id_fkey;

ALTER TABLE public.responses
ADD CONSTRAINT responses_review_id_fkey 
FOREIGN KEY (review_id) 
REFERENCES public.reviews(id) 
ON DELETE CASCADE;