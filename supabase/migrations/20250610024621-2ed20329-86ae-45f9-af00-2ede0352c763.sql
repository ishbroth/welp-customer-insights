
-- Check if the account exists in any table
-- First, let's check auth.users table
SELECT 'auth.users' as table_name, id, email, phone, created_at 
FROM auth.users 
WHERE email ILIKE '%iw@sdcarealty%' OR phone LIKE '%619%724%2702%';

-- Check profiles table
SELECT 'profiles' as table_name, id, email, phone, name, type, created_at 
FROM public.profiles 
WHERE email ILIKE '%iw@sdcarealty%' OR phone LIKE '%619%724%2702%';

-- Check business_info table
SELECT 'business_info' as table_name, id, business_name, license_number 
FROM public.business_info bi
WHERE EXISTS (
  SELECT 1 FROM public.profiles p 
  WHERE p.id = bi.id 
  AND (p.email ILIKE '%iw@sdcarealty%' OR p.phone LIKE '%619%724%2702%')
);

-- Check reviews table
SELECT 'reviews' as table_name, id, business_id, customer_id, customer_name, customer_phone 
FROM public.reviews 
WHERE customer_phone LIKE '%619%724%2702%' 
OR business_id IN (
  SELECT id FROM public.profiles 
  WHERE email ILIKE '%iw@sdcarealty%' OR phone LIKE '%619%724%2702%'
);

-- Check responses table
SELECT 'responses' as table_name, id, author_id, review_id 
FROM public.responses 
WHERE author_id IN (
  SELECT id FROM public.profiles 
  WHERE email ILIKE '%iw@sdcarealty%' OR phone LIKE '%619%724%2702%'
);

-- Check verification_requests table
SELECT 'verification_requests' as table_name, id, user_id, business_name, phone 
FROM public.verification_requests 
WHERE phone LIKE '%619%724%2702%' 
OR user_id IN (
  SELECT id FROM public.profiles 
  WHERE email ILIKE '%iw@sdcarealty%' OR phone LIKE '%619%724%2702%'
);

-- Check subscriptions table
SELECT 'subscriptions' as table_name, id, user_id, type, status 
FROM public.subscriptions 
WHERE user_id IN (
  SELECT id FROM public.profiles 
  WHERE email ILIKE '%iw@sdcarealty%' OR phone LIKE '%619%724%2702%'
);

-- Check credits table
SELECT 'credits' as table_name, id, user_id, balance 
FROM public.credits 
WHERE user_id IN (
  SELECT id FROM public.profiles 
  WHERE email ILIKE '%iw@sdcarealty%' OR phone LIKE '%619%724%2702%'
);

-- Check customer_access table
SELECT 'customer_access' as table_name, id, business_id, customer_id 
FROM public.customer_access 
WHERE business_id IN (
  SELECT id FROM public.profiles 
  WHERE email ILIKE '%iw@sdcarealty%' OR phone LIKE '%619%724%2702%'
) OR customer_id IN (
  SELECT id FROM public.profiles 
  WHERE email ILIKE '%iw@sdcarealty%' OR phone LIKE '%619%724%2702%'
);
