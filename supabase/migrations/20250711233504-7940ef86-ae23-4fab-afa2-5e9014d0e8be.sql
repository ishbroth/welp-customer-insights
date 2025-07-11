
-- Ultra-comprehensive hard delete with cascade operations and cleanup
-- This will remove ALL data and reset the database to pristine state

-- First, disable all triggers temporarily to prevent cascade issues
SET session_replication_role = replica;

-- Delete all dependent data in reverse dependency order
DELETE FROM public.responses;
DELETE FROM public.review_photos;
DELETE FROM public.review_reports;
DELETE FROM public.review_claim_history;
DELETE FROM public.user_review_notifications;
DELETE FROM public.reviews;

-- Delete all user-related metadata
DELETE FROM public.notification_preferences;
DELETE FROM public.notifications_log;
DELETE FROM public.device_tokens;
DELETE FROM public.user_sessions;

-- Delete all access and verification records
DELETE FROM public.guest_access;
DELETE FROM public.verification_codes;
DELETE FROM public.verification_requests;
DELETE FROM public.customer_access;

-- Delete all financial records
DELETE FROM public.credit_transactions;
DELETE FROM public.credits;
DELETE FROM public.subscriptions;

-- Delete all business records
DELETE FROM public.business_info;

-- Delete ALL profiles (this should remove all user data)
DELETE FROM public.profiles;

-- Delete ALL auth users with CASCADE (this will remove any remaining references)
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

-- Clean up any remaining identity sequences
DO $$
DECLARE
    table_record RECORD;
BEGIN
    FOR table_record IN 
        SELECT schemaname, tablename, columnname, sequencename
        FROM information_schema.columns 
        JOIN pg_sequences ON pg_sequences.sequencename = pg_get_serial_sequence(schemaname||'.'||tablename, columnname)
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('ALTER SEQUENCE %I RESTART WITH 1', table_record.sequencename);
    END LOOP;
END $$;

-- Vacuum and analyze all tables to reclaim space and update statistics
VACUUM FULL public.profiles;
VACUUM FULL public.business_info;
VACUUM FULL public.reviews;
VACUUM FULL public.responses;
VACUUM FULL public.verification_codes;
VACUUM FULL auth.users;

-- Refresh any materialized views
DO $$
DECLARE
    view_record RECORD;
BEGIN
    FOR view_record IN 
        SELECT schemaname, matviewname 
        FROM pg_matviews 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('REFRESH MATERIALIZED VIEW %I.%I', view_record.schemaname, view_record.matviewname);
    END LOOP;
END $$;

-- Clear any cached query plans and statistics
DISCARD ALL;

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
    
    RAISE NOTICE 'Final counts - Profiles: %, Auth Users: %, Business Info: %', profile_count, auth_count, business_count;
    
    IF profile_count > 0 OR auth_count > 0 OR business_count > 0 THEN
        RAISE EXCEPTION 'Hard delete failed - remaining records found';
    END IF;
END $$;
