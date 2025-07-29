-- Create customer_review_associations table for permanent review associations
CREATE TABLE public.customer_review_associations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL,
  review_id UUID NOT NULL,
  association_type TEXT NOT NULL CHECK (association_type IN ('purchased', 'responded')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(customer_id, review_id)
);

-- Enable Row Level Security
ALTER TABLE public.customer_review_associations ENABLE ROW LEVEL SECURITY;

-- Create policies for customer_review_associations
CREATE POLICY "Users can view their own associations" 
ON public.customer_review_associations 
FOR SELECT 
USING (auth.uid() = customer_id);

CREATE POLICY "Users can create their own associations" 
ON public.customer_review_associations 
FOR INSERT 
WITH CHECK (auth.uid() = customer_id);

-- Create index for performance
CREATE INDEX idx_customer_review_associations_customer_id ON public.customer_review_associations(customer_id);
CREATE INDEX idx_customer_review_associations_review_id ON public.customer_review_associations(review_id);