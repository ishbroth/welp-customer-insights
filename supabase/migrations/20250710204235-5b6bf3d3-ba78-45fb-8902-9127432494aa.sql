
-- Comprehensive hard delete of all data to ensure clean state
-- This will remove all traces of accounts and reviews

-- Delete all dependent data first to avoid foreign key constraints
DELETE FROM public.responses;
DELETE FROM public.review_photos;
DELETE FROM public.review_reports;
DELETE FROM public.review_claim_history;
DELETE FROM public.user_review_notifications;
DELETE FROM public.reviews;

-- Delete all notification and user-related data
DELETE FROM public.notification_preferences;
DELETE FROM public.notifications_log;
DELETE FROM public.device_tokens;

-- Delete all access and verification data
DELETE FROM public.guest_access;
DELETE FROM public.verification_codes;
DELETE FROM public.verification_requests;
DELETE FROM public.customer_access;
DELETE FROM public.user_sessions;

-- Delete all credit and subscription data
DELETE FROM public.credit_transactions;
DELETE FROM public.credits;
DELETE FROM public.subscriptions;

-- Delete all business information
DELETE FROM public.business_info;

-- Delete all user profiles
DELETE FROM public.profiles;

-- Delete all auth users (this cascades to any remaining references)
DELETE FROM auth.users;

-- Reset all sequences to start from 1
DO $$
DECLARE
    seq_record RECORD;
BEGIN
    -- Reset sequences for tables that have serial/identity columns
    FOR seq_record IN 
        SELECT schemaname, sequencename, tablename, columnname
        FROM pg_sequences 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('SELECT setval(%L, 1, false)', seq_record.schemaname||'.'||seq_record.sequencename);
    END LOOP;
END $$;

-- Clean up any cached data or materialized views if they exist
-- This ensures search functions won't find stale data
REFRESH MATERIALIZED VIEW IF EXISTS public.search_cache;

-- Vacuum all tables to reclaim space and reset statistics
VACUUM ANALYZE public.profiles;
VACUUM ANALYZE public.business_info;
VACUUM ANALYZE public.reviews;
VACUUM ANALYZE public.responses;
VACUUM ANALYZE public.verification_codes;
VACUUM ANALYZE auth.users;

-- Reset any cached query plans
DISCARD ALL;
