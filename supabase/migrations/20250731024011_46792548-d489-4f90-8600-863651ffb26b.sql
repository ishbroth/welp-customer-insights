-- Update claim_review_via_conversation to handle already claimed reviews
CREATE OR REPLACE FUNCTION public.claim_review_via_conversation(p_review_id uuid, p_customer_id uuid, p_content text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_business_id UUID;
  v_message_id UUID;
  v_message_order INTEGER;
  v_claim_result BOOLEAN;
  v_existing_claim_customer UUID;
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
  
  -- Check if review is already claimed by someone
  SELECT claimed_by INTO v_existing_claim_customer
  FROM public.review_claims
  WHERE review_id = p_review_id;
  
  -- If review is already claimed by a different user, prevent conversation
  IF v_existing_claim_customer IS NOT NULL AND v_existing_claim_customer != p_customer_id THEN
    RAISE EXCEPTION 'Review is already claimed by another user';
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
  
  -- Only try to claim if not already claimed by this user
  IF v_existing_claim_customer IS NULL THEN
    SELECT public.claim_review(p_review_id, p_customer_id, 'conversation_response', NULL) INTO v_claim_result;
    
    IF NOT v_claim_result THEN
      RAISE EXCEPTION 'Failed to claim review - it may already be claimed';
    END IF;
  END IF;
  
  RETURN v_message_id;
END;
$function$