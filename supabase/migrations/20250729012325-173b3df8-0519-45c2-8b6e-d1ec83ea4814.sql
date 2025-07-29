-- Delete the specific duplicate responses from isaac.wiley99@gmail.com
DELETE FROM public.responses 
WHERE id IN (
  '3e107b51-0dae-450e-b1fb-4b222a177c51',
  '55a18bbe-537a-43e9-840a-62c8066d10d7', 
  '46094d71-eb23-43c7-8158-84d915f63d4f'
);

-- Add a database function to prevent consecutive responses from the same author
CREATE OR REPLACE FUNCTION public.check_consecutive_responses()
RETURNS TRIGGER AS $$
DECLARE
  last_author_id uuid;
BEGIN
  -- Get the author_id of the most recent response for this review
  SELECT author_id INTO last_author_id
  FROM public.responses 
  WHERE review_id = NEW.review_id 
  ORDER BY created_at DESC 
  LIMIT 1;
  
  -- If the last response was from the same author, prevent the insert
  IF last_author_id IS NOT NULL AND last_author_id = NEW.author_id THEN
    RAISE EXCEPTION 'Cannot add consecutive responses from the same author';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;