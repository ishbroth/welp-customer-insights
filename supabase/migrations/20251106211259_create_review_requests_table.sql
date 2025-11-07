-- Create review_requests table for tracking customer requests for reviews
CREATE TABLE IF NOT EXISTS public.review_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_email TEXT NOT NULL,
  business_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  business_name TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_review_requests_customer ON public.review_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_review_requests_business_email ON public.review_requests(business_email);
CREATE INDEX IF NOT EXISTS idx_review_requests_sent_at ON public.review_requests(sent_at);
CREATE INDEX IF NOT EXISTS idx_review_requests_customer_business ON public.review_requests(customer_id, business_email);

-- Enable Row Level Security
ALTER TABLE public.review_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Customers can view their own review requests
CREATE POLICY "Customers can view their own review requests"
  ON public.review_requests
  FOR SELECT
  USING (auth.uid() = customer_id);

-- RLS Policy: Customers can insert their own review requests
CREATE POLICY "Customers can insert their own review requests"
  ON public.review_requests
  FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

-- No update or delete policies - requests are permanent logs

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_review_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER review_requests_updated_at
  BEFORE UPDATE ON public.review_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_review_requests_updated_at();

-- Grant necessary permissions
GRANT SELECT, INSERT ON public.review_requests TO authenticated;
