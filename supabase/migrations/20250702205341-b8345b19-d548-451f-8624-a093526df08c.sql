
-- Create guest_access table to track guest payments and access permissions
CREATE TABLE public.guest_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  access_token TEXT NOT NULL UNIQUE,
  review_id UUID NOT NULL,
  stripe_session_id TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add foreign key constraint to reviews table
ALTER TABLE public.guest_access 
ADD CONSTRAINT guest_access_review_id_fkey 
FOREIGN KEY (review_id) REFERENCES public.reviews(id) ON DELETE CASCADE;

-- Enable Row Level Security
ALTER TABLE public.guest_access ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read guest access (needed for validation)
CREATE POLICY "Anyone can read guest access for validation" 
ON public.guest_access 
FOR SELECT 
USING (true);

-- Create policy for edge functions to insert guest access records
CREATE POLICY "Edge functions can insert guest access" 
ON public.guest_access 
FOR INSERT 
WITH CHECK (true);

-- Create index on access_token for fast lookups
CREATE INDEX idx_guest_access_token ON public.guest_access(access_token);

-- Create index on review_id for cleanup queries
CREATE INDEX idx_guest_access_review_id ON public.guest_access(review_id);

-- Create index on expires_at for cleanup of expired tokens
CREATE INDEX idx_guest_access_expires_at ON public.guest_access(expires_at);
