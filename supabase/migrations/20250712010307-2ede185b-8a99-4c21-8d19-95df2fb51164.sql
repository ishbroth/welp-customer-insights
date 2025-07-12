
-- Even more comprehensive hard delete with explicit table clearing
-- This will ensure ALL data is removed, including any orphaned records

-- First, disable all triggers temporarily to prevent cascade issues
SET session_replication_role = replica;

-- Delete ALL data from public schema tables in dependency order
TRUNCATE TABLE public.user_review_notifications CASCADE;
TRUNCATE TABLE public.review_photos CASCADE;
TRUNCATE TABLE public.responses CASCADE;
TRUNCATE TABLE public.review_reports CASCADE;
TRUNCATE TABLE public.review_claim_history CASCADE;
TRUNCATE TABLE public.reviews CASCADE;
TRUNCATE TABLE public.guest_access CASCADE;
TRUNCATE TABLE public.customer_access CASCADE;
TRUNCATE TABLE public.verification_codes CASCADE;
TRUNCATE TABLE public.verification_requests CASCADE;
TRUNCATE TABLE public.credit_transactions CASCADE;
TRUNCATE TABLE public.credits CASCADE;
TRUNCATE TABLE public.subscriptions CASCADE;
TRUNCATE TABLE public.business_info CASCADE;
TRUNCATE TABLE public.notification_preferences CASCADE;
TRUNCATE TABLE public.notifications_log CASCADE;
TRUNCATE TABLE public.device_tokens CASCADE;
TRUNCATE TABLE public.user_sessions CASCADE;

-- CRITICAL: Delete ALL profiles (this should have been deleted before)
TRUNCATE TABLE public.profiles CASCADE;

-- Delete ALL auth users (this should also remove any remaining references)
DELETE FROM auth.users;

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

-- Final verification - count remaining records in key tables
DO $$
DECLARE
    profile_count INTEGER;
    auth_count INTEGER;
    business_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO profile_count FROM public.profiles;
    SELECT COUNT(*) INTO auth_count FROM auth.users;
    SELECT COUNT(*) INTO business_count FROM public.business_info;
    
    RAISE NOTICE 'Final counts after TRUNCATE - Profiles: %, Auth Users: %, Business Info: %', profile_count, auth_count, business_count;
    
    IF profile_count > 0 OR auth_count > 0 OR business_count > 0 THEN
        RAISE EXCEPTION 'Hard delete failed - remaining records found: Profiles=%, Auth=%, Business=%', profile_count, auth_count, business_count;
    END IF;
END $$;
