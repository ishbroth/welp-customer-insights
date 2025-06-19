
-- Add a deleted_at column to track when reviews are deleted (soft delete)
ALTER TABLE public.reviews 
ADD COLUMN deleted_at timestamp with time zone DEFAULT NULL;

-- Add a table to track review claim history for automatic re-linking
CREATE TABLE public.review_claim_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id uuid NOT NULL,
  customer_name text,
  customer_phone text,
  customer_address text,
  customer_city text,
  customer_zipcode text,
  business_id uuid NOT NULL,
  original_review_id uuid,
  claimed_at timestamp with time zone NOT NULL DEFAULT now(),
  broken_at timestamp with time zone DEFAULT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on the new table
ALTER TABLE public.review_claim_history ENABLE ROW LEVEL SECURITY;

-- Create policies for review_claim_history
CREATE POLICY "Users can view their own claim history" 
  ON public.review_claim_history 
  FOR SELECT 
  USING (auth.uid() = customer_id);

CREATE POLICY "Users can create their own claim history" 
  ON public.review_claim_history 
  FOR INSERT 
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can update their own claim history" 
  ON public.review_claim_history 
  FOR UPDATE 
  USING (auth.uid() = customer_id);

-- Create a table for review reports
CREATE TABLE public.review_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id uuid NOT NULL REFERENCES public.reviews(id),
  reporter_id uuid NOT NULL,
  reporter_name text,
  reporter_email text,
  reporter_phone text,
  is_about_reporter boolean NOT NULL DEFAULT false,
  complaint text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  processed_at timestamp with time zone DEFAULT NULL
);

-- Enable RLS on review_reports
ALTER TABLE public.review_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for review_reports
CREATE POLICY "Users can create their own reports" 
  ON public.review_reports 
  FOR INSERT 
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports" 
  ON public.review_reports 
  FOR SELECT 
  USING (auth.uid() = reporter_id);

-- Function to handle review deletion and claim breaking
CREATE OR REPLACE FUNCTION public.handle_review_deletion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If review is being soft deleted (deleted_at is being set)
  IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
    -- Break the claim by recording it in history and clearing the review's claim
    IF OLD.customer_id IS NOT NULL THEN
      INSERT INTO public.review_claim_history (
        customer_id,
        customer_name,
        customer_phone,
        customer_address,
        customer_city,
        customer_zipcode,
        business_id,
        original_review_id,
        claimed_at,
        broken_at
      ) VALUES (
        OLD.customer_id,
        OLD.customer_name,
        OLD.customer_phone,
        OLD.customer_address,
        OLD.customer_city,
        OLD.customer_zipcode,
        OLD.business_id,
        OLD.id,
        OLD.claimed_at,
        NEW.deleted_at
      );
      
      -- Clear the claim from the review
      NEW.customer_id = NULL;
      NEW.claimed_at = NULL;
      NEW.claimed_by = NULL;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for review deletion
CREATE TRIGGER on_review_deletion
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_review_deletion();

-- Function to auto-relink reviews based on claim history
CREATE OR REPLACE FUNCTION public.auto_relink_review()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  matching_history record;
BEGIN
  -- Only process new reviews (not updates)
  IF TG_OP = 'INSERT' THEN
    -- Look for matching claim history
    SELECT * INTO matching_history
    FROM public.review_claim_history
    WHERE business_id = NEW.business_id
      AND customer_name = NEW.customer_name
      AND customer_phone = NEW.customer_phone
      AND customer_address = NEW.customer_address
      AND customer_city = NEW.customer_city
      AND customer_zipcode = NEW.customer_zipcode
      AND broken_at IS NOT NULL
    ORDER BY broken_at DESC
    LIMIT 1;
    
    -- If we found matching history, auto-relink
    IF matching_history IS NOT NULL THEN
      NEW.customer_id = matching_history.customer_id;
      NEW.claimed_at = now();
      NEW.claimed_by = matching_history.customer_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for auto-relinking
CREATE TRIGGER on_review_auto_relink
  BEFORE INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_relink_review();
