-- Create review conversations table for storing conversation messages
CREATE TABLE public.review_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  author_type TEXT NOT NULL CHECK (author_type IN ('business', 'customer')),
  content TEXT NOT NULL,
  message_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create conversation participants table to track active conversations
CREATE TABLE public.conversation_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL,
  business_id UUID NOT NULL,
  first_customer_response_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(review_id)
);

-- Enable RLS on both tables
ALTER TABLE public.review_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;

-- RLS policies for review_conversations
CREATE POLICY "Anyone can view conversations" 
ON public.review_conversations 
FOR SELECT 
USING (true);

CREATE POLICY "Conversation participants can add messages" 
ON public.review_conversations 
FOR INSERT 
WITH CHECK (
  auth.uid() = author_id AND
  EXISTS (
    SELECT 1 FROM public.reviews r 
    WHERE r.id = review_conversations.review_id 
    AND (r.business_id = auth.uid() OR 
         EXISTS (SELECT 1 FROM public.conversation_participants cp 
                WHERE cp.review_id = r.id AND cp.customer_id = auth.uid()))
  )
);

CREATE POLICY "Authors can update their own messages" 
ON public.review_conversations 
FOR UPDATE 
USING (auth.uid() = author_id);

-- RLS policies for conversation_participants
CREATE POLICY "Anyone can view participants" 
ON public.conversation_participants 
FOR SELECT 
USING (true);

CREATE POLICY "Customers can create participant records" 
ON public.conversation_participants 
FOR INSERT 
WITH CHECK (auth.uid() = customer_id);

-- Create indexes for performance
CREATE INDEX idx_review_conversations_review_id ON public.review_conversations(review_id);
CREATE INDEX idx_review_conversations_author ON public.review_conversations(author_id, author_type);
CREATE INDEX idx_conversation_participants_review_id ON public.conversation_participants(review_id);
CREATE INDEX idx_conversation_participants_customer ON public.conversation_participants(customer_id);

-- Create function to automatically claim review and create participant record
CREATE OR REPLACE FUNCTION public.claim_review_via_conversation(
  p_review_id UUID,
  p_customer_id UUID,
  p_content TEXT
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  v_business_id UUID;
  v_message_id UUID;
  v_message_order INTEGER;
BEGIN
  -- Get the business_id from the review
  SELECT business_id INTO v_business_id
  FROM public.reviews
  WHERE id = p_review_id;
  
  IF v_business_id IS NULL THEN
    RAISE EXCEPTION 'Review not found';
  END IF;
  
  -- Check if conversation already exists
  IF EXISTS (SELECT 1 FROM public.conversation_participants WHERE review_id = p_review_id) THEN
    RAISE EXCEPTION 'Conversation already exists for this review';
  END IF;
  
  -- Create conversation participant record
  INSERT INTO public.conversation_participants (
    review_id, customer_id, business_id, first_customer_response_at
  ) VALUES (
    p_review_id, p_customer_id, v_business_id, now()
  );
  
  -- Get the next message order (should be 1 for first customer response)
  SELECT COALESCE(MAX(message_order), 0) + 1 INTO v_message_order
  FROM public.review_conversations
  WHERE review_id = p_review_id;
  
  -- Insert the customer's first message
  INSERT INTO public.review_conversations (
    review_id, author_id, author_type, content, message_order
  ) VALUES (
    p_review_id, p_customer_id, 'customer', p_content, v_message_order
  ) RETURNING id INTO v_message_id;
  
  -- Claim the review using existing claim system
  PERFORM public.claim_review(p_review_id, p_customer_id, 'conversation_response');
  
  RETURN v_message_id;
END;
$$;

-- Create function to add conversation message
CREATE OR REPLACE FUNCTION public.add_conversation_message(
  p_review_id UUID,
  p_author_id UUID,
  p_author_type TEXT,
  p_content TEXT
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  v_message_id UUID;
  v_message_order INTEGER;
BEGIN
  -- Validate author_type
  IF p_author_type NOT IN ('business', 'customer') THEN
    RAISE EXCEPTION 'Invalid author_type. Must be business or customer';
  END IF;
  
  -- Verify conversation exists
  IF NOT EXISTS (SELECT 1 FROM public.conversation_participants WHERE review_id = p_review_id) THEN
    RAISE EXCEPTION 'No conversation exists for this review';
  END IF;
  
  -- Get the next message order
  SELECT COALESCE(MAX(message_order), 0) + 1 INTO v_message_order
  FROM public.review_conversations
  WHERE review_id = p_review_id;
  
  -- Insert the message
  INSERT INTO public.review_conversations (
    review_id, author_id, author_type, content, message_order
  ) VALUES (
    p_review_id, p_author_id, p_author_type, p_content, v_message_order
  ) RETURNING id INTO v_message_id;
  
  RETURN v_message_id;
END;
$$;