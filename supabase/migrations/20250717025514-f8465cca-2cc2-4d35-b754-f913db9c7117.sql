
-- Fix security vulnerabilities in database functions by setting secure search_path
-- This prevents schema poisoning attacks

-- 1. Fix clean_expired_verification_codes function
CREATE OR REPLACE FUNCTION public.clean_expired_verification_codes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  DELETE FROM public.verification_codes WHERE expires_at < NOW();
  RETURN NULL;
END;
$function$;

-- 2. Fix update_user_credits function
CREATE OR REPLACE FUNCTION public.update_user_credits(p_user_id uuid, p_amount integer, p_type text, p_description text DEFAULT NULL::text, p_stripe_session_id text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  -- Insert transaction record
  INSERT INTO public.credit_transactions (user_id, type, amount, description, stripe_session_id)
  VALUES (p_user_id, p_type, p_amount, p_description, p_stripe_session_id);
  
  -- Update or insert credits balance
  INSERT INTO public.credits (user_id, balance)
  VALUES (p_user_id, GREATEST(0, p_amount))
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    balance = GREATEST(0, credits.balance + p_amount),
    updated_at = now();
END;
$function$;

-- 3. Fix handle_review_deletion function
CREATE OR REPLACE FUNCTION public.handle_review_deletion()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER SET search_path = ''
AS $function$
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
$function$;

-- 4. Fix auto_relink_review function
CREATE OR REPLACE FUNCTION public.auto_relink_review()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER SET search_path = ''
AS $function$
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
$function$;

-- 5. Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, type, first_name, last_name)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'type', 'customer'),
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  
  -- If user is a business, create business_info record
  IF COALESCE(NEW.raw_user_meta_data->>'type', 'customer') = 'business' THEN
    INSERT INTO public.business_info (id, business_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'business_name', 'New Business'));
  END IF;
  
  RETURN NEW;
END;
$function$;
