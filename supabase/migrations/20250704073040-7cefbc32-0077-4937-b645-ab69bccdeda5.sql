
-- Hard delete all user accounts and related data
-- Start with dependent tables first to avoid foreign key constraints

-- Delete all responses
DELETE FROM public.responses;

-- Delete all review photos
DELETE FROM public.review_photos;

-- Delete all review reports
DELETE FROM public.review_reports;

-- Delete all review claim history
DELETE FROM public.review_claim_history;

-- Delete all user review notifications
DELETE FROM public.user_review_notifications;

-- Delete all reviews
DELETE FROM public.reviews;

-- Delete all notification preferences
DELETE FROM public.notification_preferences;

-- Delete all notifications log
DELETE FROM public.notifications_log;

-- Delete all guest access
DELETE FROM public.guest_access;

-- Delete all verification codes
DELETE FROM public.verification_codes;

-- Delete all subscriptions
DELETE FROM public.subscriptions;

-- Delete all device tokens
DELETE FROM public.device_tokens;

-- Delete all verification requests
DELETE FROM public.verification_requests;

-- Delete all credit transactions
DELETE FROM public.credit_transactions;

-- Delete all credits
DELETE FROM public.credits;

-- Delete all customer access
DELETE FROM public.customer_access;

-- Delete all user sessions
DELETE FROM public.user_sessions;

-- Delete all business info
DELETE FROM public.business_info;

-- Delete all profiles
DELETE FROM public.profiles;

-- Finally, delete all auth users (this will cascade to any remaining references)
DELETE FROM auth.users;

-- Reset sequences if needed
SELECT setval(pg_get_serial_sequence('public.profiles', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('public.reviews', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('public.responses', 'id'), 1, false);
