
-- Add claim tracking and improve review matching
ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS claimed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS claimed_by uuid REFERENCES auth.users(id);

-- Add indexes for better performance on matching queries
CREATE INDEX IF NOT EXISTS idx_reviews_customer_name ON public.reviews USING gin(to_tsvector('english', customer_name));
CREATE INDEX IF NOT EXISTS idx_reviews_customer_phone ON public.reviews (customer_phone);
CREATE INDEX IF NOT EXISTS idx_reviews_customer_city_state ON public.reviews (customer_city, customer_zipcode);
CREATE INDEX IF NOT EXISTS idx_reviews_unclaimed ON public.reviews (customer_id) WHERE customer_id IS NULL;

-- Add session tracking for new reviews
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  last_login timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on user_sessions
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Policy for users to manage their own sessions
CREATE POLICY "Users can manage their own sessions" ON public.user_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Add table to track which reviews were shown as new to users
CREATE TABLE IF NOT EXISTS public.user_review_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  review_id uuid REFERENCES public.reviews(id) ON DELETE CASCADE,
  shown_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, review_id)
);

-- Enable RLS on user_review_notifications
ALTER TABLE public.user_review_notifications ENABLE ROW LEVEL SECURITY;

-- Policy for users to manage their own notifications
CREATE POLICY "Users can manage their own review notifications" ON public.user_review_notifications
  FOR ALL USING (auth.uid() = user_id);
