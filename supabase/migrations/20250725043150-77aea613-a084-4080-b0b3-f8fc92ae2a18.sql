
-- Fix RLS policies to restrict profile access and prevent data leakage
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Public can view business profile info for reviews" ON public.profiles;
DROP POLICY IF EXISTS "Public can view business info for reviews" ON public.business_info;

-- Create more restrictive profile policies
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view public business profiles only" ON public.profiles
FOR SELECT USING (
  auth.uid() = id OR 
  (type = 'business' AND verified = true)
);

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT type FROM public.profiles WHERE id = user_id;
$$;

-- Update business_info policies to be more restrictive
CREATE POLICY "Business owners can view their own business info" ON public.business_info
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Public can view verified business info only" ON public.business_info
FOR SELECT USING (
  auth.uid() = id OR 
  (verified = true AND id IN (
    SELECT id FROM public.profiles WHERE type = 'business' AND verified = true
  ))
);

-- Add rate limiting table for authentication attempts
CREATE TABLE IF NOT EXISTS public.auth_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL, -- email or IP address
  attempt_type text NOT NULL, -- 'login', 'signup', 'reset_password'
  attempts integer NOT NULL DEFAULT 1,
  first_attempt_at timestamp with time zone NOT NULL DEFAULT now(),
  last_attempt_at timestamp with time zone NOT NULL DEFAULT now(),
  blocked_until timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on rate limits table
ALTER TABLE public.auth_rate_limits ENABLE ROW LEVEL SECURITY;

-- Create policy for rate limits (only edge functions can manage this)
CREATE POLICY "Service role can manage rate limits" ON public.auth_rate_limits
FOR ALL USING (true);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_auth_rate_limits_identifier ON public.auth_rate_limits(identifier);
CREATE INDEX IF NOT EXISTS idx_auth_rate_limits_type ON public.auth_rate_limits(attempt_type);
CREATE INDEX IF NOT EXISTS idx_auth_rate_limits_blocked ON public.auth_rate_limits(blocked_until);

-- Create function to check rate limits
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier text,
  p_attempt_type text,
  p_max_attempts integer DEFAULT 5,
  p_window_minutes integer DEFAULT 15,
  p_block_minutes integer DEFAULT 30
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Update verification_codes table to have shorter expiry
ALTER TABLE public.verification_codes 
ADD COLUMN IF NOT EXISTS max_attempts integer DEFAULT 3,
ADD COLUMN IF NOT EXISTS attempt_count integer DEFAULT 0;

-- Create function to validate verification codes with attempt limiting
CREATE OR REPLACE FUNCTION public.validate_verification_code(
  p_code text,
  p_identifier text,
  p_type text DEFAULT 'phone'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Create security audit log table
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  event_type text NOT NULL,
  event_description text NOT NULL,
  ip_address text,
  user_agent text,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Create policy for audit log (only service role can manage)
CREATE POLICY "Service role can manage audit log" ON public.security_audit_log
FOR ALL USING (true);

-- Add indexes for audit log
CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_id ON public.security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_event_type ON public.security_audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_created_at ON public.security_audit_log(created_at);

-- Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_user_id uuid,
  p_event_type text,
  p_event_description text,
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_metadata jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id, event_type, event_description, ip_address, user_agent, metadata
  ) VALUES (
    p_user_id, p_event_type, p_event_description, p_ip_address, p_user_agent, p_metadata
  );
END;
$$;
