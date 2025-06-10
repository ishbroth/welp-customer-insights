
-- Comprehensive check for any remaining traces of iw@sdcarealty.com
-- Check auth.users table directly
SELECT 'auth.users' as source, id, email, phone, created_at, email_confirmed_at
FROM auth.users 
WHERE email ILIKE '%sdcarealty%';

-- Check all profiles variations
SELECT 'profiles' as source, id, email, phone, name, type, created_at 
FROM public.profiles 
WHERE email ILIKE '%sdcarealty%';

-- Check if there are any orphaned business_info records
SELECT 'business_info_orphaned' as source, id, business_name, license_number
FROM public.business_info 
WHERE id NOT IN (SELECT id FROM public.profiles WHERE id IS NOT NULL);

-- Check for any soft-deleted or inactive records that might exist
SELECT 'verification_codes' as source, id, phone, created_at, expires_at
FROM public.verification_codes 
WHERE phone LIKE '%619%724%2702%' AND expires_at > NOW();

-- Check for any pending verification requests
SELECT 'verification_requests' as source, id, business_name, phone, status
FROM public.verification_requests 
WHERE phone LIKE '%619%724%2702%' OR business_name ILIKE '%painted painter%';

-- Check credit transactions that might reference the deleted user
SELECT 'credit_transactions' as source, id, user_id, description, created_at
FROM public.credit_transactions 
WHERE description ILIKE '%sdcarealty%';

-- Check notification logs (fixed - using sent_at instead of created_at)
SELECT 'notifications_log' as source, id, user_id, content, sent_at
FROM public.notifications_log 
WHERE content ILIKE '%sdcarealty%';
