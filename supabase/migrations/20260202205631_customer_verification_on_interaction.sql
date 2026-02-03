-- Customer Verification on Interaction
-- Changes customer verification from "verified on email confirmation" to
-- "verified on first meaningful review interaction" (credit purchase or conversation response).
-- Business accounts are NOT affected - they use separate license verification.

-- Create function to verify customer on first meaningful interaction
CREATE OR REPLACE FUNCTION public.verify_customer_on_interaction(p_customer_id UUID)
RETURNS VOID AS $$
BEGIN
  -- ONLY updates customer accounts, never business accounts
  -- This is idempotent - safe to call multiple times
  UPDATE public.profiles
  SET verified = true
  WHERE id = p_customer_id
    AND type = 'customer'  -- CRITICAL: Only customers
    AND verified = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.verify_customer_on_interaction(UUID) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION public.verify_customer_on_interaction(UUID) IS
  'Marks a customer as verified when they perform their first meaningful review interaction (credit usage or conversation response). Only affects customer accounts with type=customer and verified=false. Business accounts use separate license verification and are not affected by this function.';

-- Update claim_review_via_conversation to verify customer on first response
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
  v_review_customer_data RECORD;
BEGIN
  -- Get the business_id and customer data from the review
  SELECT business_id, customer_name, customer_phone, customer_address, customer_city, customer_zipcode
  INTO v_business_id, v_review_customer_data.customer_name, v_review_customer_data.customer_phone,
       v_review_customer_data.customer_address, v_review_customer_data.customer_city, v_review_customer_data.customer_zipcode
  FROM public.reviews
  WHERE id = p_review_id;

  IF v_business_id IS NULL THEN
    RAISE EXCEPTION 'Review not found';
  END IF;

  -- Validate that the customer attempting to claim matches the review's customer data
  -- This prevents customers from responding to reviews not about them
  DECLARE
    v_customer_profile RECORD;
  BEGIN
    SELECT first_name, last_name, phone, address, city, zipcode
    INTO v_customer_profile
    FROM public.profiles
    WHERE id = p_customer_id;

    IF v_customer_profile IS NULL THEN
      RAISE EXCEPTION 'Customer profile not found';
    END IF;

    -- Check if customer data matches (at minimum phone number should match)
    IF v_review_customer_data.customer_phone IS NOT NULL AND
       v_customer_profile.phone IS NOT NULL AND
       v_review_customer_data.customer_phone != v_customer_profile.phone THEN
      RAISE EXCEPTION 'Customer identity validation failed - phone number mismatch';
    END IF;

    -- Additional validation for name if available
    IF v_review_customer_data.customer_name IS NOT NULL AND
       v_customer_profile.first_name IS NOT NULL AND
       v_customer_profile.last_name IS NOT NULL THEN
      DECLARE
        v_full_name TEXT := CONCAT(v_customer_profile.first_name, ' ', v_customer_profile.last_name);
      BEGIN
        IF LOWER(v_review_customer_data.customer_name) != LOWER(v_full_name) THEN
          RAISE EXCEPTION 'Customer identity validation failed - name mismatch';
        END IF;
      END;
    END IF;
  END;

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

  -- Verify the customer on first conversation response
  PERFORM public.verify_customer_on_interaction(p_customer_id);

  RETURN v_message_id;
END;
$function$;
