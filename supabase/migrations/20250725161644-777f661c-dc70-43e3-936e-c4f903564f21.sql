
-- Fix the syntax error in enhancedSecurityHelpers and implement Phase 1 database security fixes

-- Update existing database functions to include proper search path restrictions
CREATE OR REPLACE FUNCTION public.check_rate_limit(p_identifier text, p_attempt_type text, p_max_attempts integer DEFAULT 5, p_window_minutes integer DEFAULT 15, p_block_minutes integer DEFAULT 30)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_attempts integer;
  window_start timestamp with time zone;
  existing_record record;
BEGIN
  window_start := now() - (p_window_minutes || ' minutes')::interval;
  
  -- Clean up old blocked records
  DELETE FROM public.auth_rate_limits 
  WHERE blocked_until < now() AND blocked_until IS NOT NULL;
  
  -- Check if currently blocked
  SELECT * INTO existing_record
  FROM public.auth_rate_limits
  WHERE identifier = p_identifier 
    AND attempt_type = p_attempt_type
    AND blocked_until > now();
    
  IF existing_record IS NOT NULL THEN
    RETURN false; -- Still blocked
  END IF;
  
  -- Count attempts in current window
  SELECT COALESCE(SUM(attempts), 0) INTO current_attempts
  FROM public.auth_rate_limits
  WHERE identifier = p_identifier 
    AND attempt_type = p_attempt_type
    AND last_attempt_at > window_start;
  
  -- If exceeded limit, block the identifier
  IF current_attempts >= p_max_attempts THEN
    INSERT INTO public.auth_rate_limits (
      identifier, attempt_type, attempts, blocked_until
    ) VALUES (
      p_identifier, p_attempt_type, 1, now() + (p_block_minutes || ' minutes')::interval
    );
    RETURN false;
  END IF;
  
  -- Record this attempt
  INSERT INTO public.auth_rate_limits (
    identifier, attempt_type, attempts
  ) VALUES (
    p_identifier, p_attempt_type, 1
  )
  ON CONFLICT (identifier, attempt_type) DO UPDATE SET
    attempts = auth_rate_limits.attempts + 1,
    last_attempt_at = now();
  
  RETURN true; -- Allow the attempt
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_verification_code(p_code text, p_identifier text, p_type text DEFAULT 'phone'::text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  code_record record;
BEGIN
  -- Find the verification code
  SELECT * INTO code_record
  FROM public.verification_codes
  WHERE code = p_code
    AND (phone = p_identifier OR email = p_identifier)
    AND verification_type = p_type
    AND expires_at > now()
    AND attempt_count < max_attempts;
  
  IF code_record IS NULL THEN
    -- Increment attempt count if code exists but is invalid
    UPDATE public.verification_codes
    SET attempt_count = attempt_count + 1
    WHERE code = p_code
      AND (phone = p_identifier OR email = p_identifier)
      AND verification_type = p_type;
    
    RETURN false;
  END IF;
  
  -- Valid code found, delete it to prevent reuse
  DELETE FROM public.verification_codes
  WHERE id = code_record.id;
  
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_security_event(p_user_id uuid, p_event_type text, p_event_description text, p_ip_address text DEFAULT NULL::text, p_user_agent text DEFAULT NULL::text, p_metadata jsonb DEFAULT NULL::jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id, event_type, event_description, ip_address, user_agent, metadata
  ) VALUES (
    p_user_id, p_event_type, p_event_description, p_ip_address, p_user_agent, p_metadata
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT type FROM public.profiles WHERE id = user_id;
$$;

CREATE OR REPLACE FUNCTION public.update_user_credits(p_user_id uuid, p_amount integer, p_type text, p_description text DEFAULT NULL::text, p_stripe_session_id text DEFAULT NULL::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.handle_review_deletion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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

CREATE OR REPLACE FUNCTION public.auto_relink_review()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;

-- Add account lockout functionality
CREATE TABLE IF NOT EXISTS public.account_lockout (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  lockout_type TEXT NOT NULL,
  locked_until TIMESTAMP WITH TIME ZONE NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(identifier, lockout_type)
);

ALTER TABLE public.account_lockout ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage account lockout"
ON public.account_lockout
FOR ALL
TO service_role
USING (true);

-- Enhanced rate limiting function with account lockout
CREATE OR REPLACE FUNCTION public.check_rate_limit_with_lockout(
  p_identifier text,
  p_attempt_type text,
  p_max_attempts integer DEFAULT 5,
  p_window_minutes integer DEFAULT 15,
  p_block_minutes integer DEFAULT 30,
  p_lockout_attempts integer DEFAULT 10,
  p_lockout_duration_minutes integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_attempts integer;
  total_attempts integer;
  window_start timestamp with time zone;
  existing_record record;
  lockout_record record;
BEGIN
  window_start := now() - (p_window_minutes || ' minutes')::interval;
  
  -- Check if account is locked out
  SELECT * INTO lockout_record
  FROM public.account_lockout
  WHERE identifier = p_identifier 
    AND lockout_type = p_attempt_type
    AND locked_until > now();
    
  IF lockout_record IS NOT NULL THEN
    RETURN false; -- Account is locked
  END IF;
  
  -- Clean up old blocked records
  DELETE FROM public.auth_rate_limits 
  WHERE blocked_until < now() AND blocked_until IS NOT NULL;
  
  -- Check if currently blocked
  SELECT * INTO existing_record
  FROM public.auth_rate_limits
  WHERE identifier = p_identifier 
    AND attempt_type = p_attempt_type
    AND blocked_until > now();
    
  IF existing_record IS NOT NULL THEN
    RETURN false; -- Still blocked
  END IF;
  
  -- Count attempts in current window
  SELECT COALESCE(SUM(attempts), 0) INTO current_attempts
  FROM public.auth_rate_limits
  WHERE identifier = p_identifier 
    AND attempt_type = p_attempt_type
    AND last_attempt_at > window_start;
  
  -- Count total attempts for lockout check
  SELECT COALESCE(SUM(attempts), 0) INTO total_attempts
  FROM public.auth_rate_limits
  WHERE identifier = p_identifier 
    AND attempt_type = p_attempt_type
    AND last_attempt_at > (now() - interval '24 hours');
  
  -- If exceeded lockout threshold, lock the account
  IF total_attempts >= p_lockout_attempts THEN
    INSERT INTO public.account_lockout (
      identifier, lockout_type, locked_until, attempts
    ) VALUES (
      p_identifier, p_attempt_type, now() + (p_lockout_duration_minutes || ' minutes')::interval, total_attempts
    )
    ON CONFLICT (identifier, lockout_type) DO UPDATE SET
      locked_until = now() + (p_lockout_duration_minutes || ' minutes')::interval,
      attempts = total_attempts;
    RETURN false;
  END IF;
  
  -- If exceeded rate limit, block temporarily
  IF current_attempts >= p_max_attempts THEN
    INSERT INTO public.auth_rate_limits (
      identifier, attempt_type, attempts, blocked_until
    ) VALUES (
      p_identifier, p_attempt_type, 1, now() + (p_block_minutes || ' minutes')::interval
    );
    RETURN false;
  END IF;
  
  -- Record this attempt
  INSERT INTO public.auth_rate_limits (
    identifier, attempt_type, attempts
  ) VALUES (
    p_identifier, p_attempt_type, 1
  )
  ON CONFLICT (identifier, attempt_type) DO UPDATE SET
    attempts = auth_rate_limits.attempts + 1,
    last_attempt_at = now();
  
  RETURN true; -- Allow the attempt
END;
$$;

-- Reduce verification code expiry time to 5 minutes
UPDATE public.verification_codes 
SET expires_at = created_at + interval '5 minutes'
WHERE expires_at > now();
