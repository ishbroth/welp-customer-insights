
-- Ultra-comprehensive cleanup to eliminate ALL orphaned data
-- This targets every possible source of phone number caching/storage

-- First, disable all triggers to prevent cascade issues
SET session_replication_role = replica;

-- CRITICAL: Clear ALL tables that might contain phone data in dependency order
TRUNCATE TABLE public.user_review_notifications CASCADE;
TRUNCATE TABLE public.review_photos CASCADE;
TRUNCATE TABLE public.responses CASCADE;
TRUNCATE TABLE public.review_reports CASCADE;
TRUNCATE TABLE public.review_claim_history CASCADE;  -- Contains customer_phone
TRUNCATE TABLE public.reviews CASCADE;              -- Contains customer_phone
TRUNCATE TABLE public.guest_access CASCADE;
TRUNCATE TABLE public.customer_access CASCADE;
TRUNCATE TABLE public.verification_codes CASCADE;   -- Contains phone
TRUNCATE TABLE public.verification_requests CASCADE; -- Contains phone
TRUNCATE TABLE public.credit_transactions CASCADE;
TRUNCATE TABLE public.credits CASCADE;
TRUNCATE TABLE public.subscriptions CASCADE;
TRUNCATE TABLE public.business_info CASCADE;
TRUNCATE TABLE public.notification_preferences CASCADE;
TRUNCATE TABLE public.notifications_log CASCADE;
TRUNCATE TABLE public.device_tokens CASCADE;
TRUNCATE TABLE public.user_sessions CASCADE;

-- CRITICAL: Delete ALL profiles 
TRUNCATE TABLE public.profiles CASCADE;

-- CRITICAL: Delete ALL auth users
DELETE FROM auth.users;

-- CRITICAL: Also clear any auth-related tables that might cache user data
DELETE FROM auth.refresh_tokens;
DELETE FROM auth.sessions;
DELETE FROM auth.mfa_amr_claims;
DELETE FROM auth.mfa_factors;
DELETE FROM auth.mfa_challenges;
DELETE FROM auth.identities;
DELETE FROM auth.audit_log_entries;

-- Re-enable triggers
SET session_replication_role = DEFAULT;

-- Reset ALL sequences to start from 1
DO $$
DECLARE
    seq_record RECORD;
BEGIN
    FOR seq_record IN 
        SELECT schemaname, sequencename
        FROM pg_sequences 
        WHERE schemaname IN ('public', 'auth')
    LOOP
        EXECUTE format('ALTER SEQUENCE %I.%I RESTART WITH 1', seq_record.schemaname, seq_record.sequencename);
    END LOOP;
END $$;

-- Clear any remaining cached data and refresh statistics
VACUUM FULL;
ANALYZE;

-- Final comprehensive verification
DO $$
DECLARE
    profile_count INTEGER;
    auth_count INTEGER;
    business_count INTEGER;
    verification_count INTEGER;
    reviews_with_phone INTEGER;
    claim_history_phone INTEGER;
BEGIN
    SELECT COUNT(*) INTO profile_count FROM public.profiles;
    SELECT COUNT(*) INTO auth_count FROM auth.users;
    SELECT COUNT(*) INTO business_count FROM public.business_info;
    SELECT COUNT(*) INTO verification_count FROM public.verification_codes;
    SELECT COUNT(*) INTO reviews_with_phone FROM public.reviews WHERE customer_phone IS NOT NULL;
    SELECT COUNT(*) INTO claim_history_phone FROM public.review_claim_history WHERE customer_phone IS NOT NULL;
    
    RAISE NOTICE 'ULTRA CLEANUP RESULTS:';
    RAISE NOTICE 'Profiles: %, Auth Users: %, Business Info: %', profile_count, auth_count, business_count;
    RAISE NOTICE 'Verification Codes: %, Reviews with Phone: %, Claim History with Phone: %', verification_count, reviews_with_phone, claim_history_phone;
    
    IF profile_count > 0 OR auth_count > 0 OR business_count > 0 OR verification_count > 0 OR reviews_with_phone > 0 OR claim_history_phone > 0 THEN
        RAISE EXCEPTION 'Ultra cleanup failed - remaining phone data found: Profiles=%, Auth=%, Business=%, Verification=%, ReviewsPhone=%, ClaimPhone=%', 
                       profile_count, auth_count, business_count, verification_count, reviews_with_phone, claim_history_phone;
    END IF;
    
    RAISE NOTICE '✅ ULTRA CLEANUP SUCCESSFUL - ALL PHONE DATA ELIMINATED';
END $$;
