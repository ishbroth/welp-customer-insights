
-- First, get the user ID for the email to ensure we're deleting the right records
DO $$
DECLARE
    target_user_id uuid;
BEGIN
    -- Get the user ID from auth.users table
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = 'iw@sdcarealty.com';
    
    IF target_user_id IS NOT NULL THEN
        -- Delete from all related tables first (to avoid foreign key constraints)
        DELETE FROM public.notification_preferences WHERE user_id = target_user_id;
        DELETE FROM public.notifications_log WHERE user_id = target_user_id;
        DELETE FROM public.subscriptions WHERE user_id = target_user_id;
        DELETE FROM public.credit_transactions WHERE user_id = target_user_id;
        DELETE FROM public.credits WHERE user_id = target_user_id;
        DELETE FROM public.customer_access WHERE business_id = target_user_id OR customer_id = target_user_id;
        DELETE FROM public.verification_requests WHERE user_id = target_user_id;
        
        -- Delete responses authored by this user
        DELETE FROM public.responses WHERE author_id = target_user_id;
        
        -- Delete reviews where this user is the business or customer
        DELETE FROM public.reviews WHERE business_id = target_user_id OR customer_id = target_user_id;
        
        -- Delete business info if this is a business account
        DELETE FROM public.business_info WHERE id = target_user_id;
        
        -- Delete the profile
        DELETE FROM public.profiles WHERE id = target_user_id;
        
        -- Finally, delete from auth.users (this should cascade to any remaining references)
        DELETE FROM auth.users WHERE id = target_user_id;
        
        RAISE NOTICE 'Successfully deleted user account for iw@sdcarealty.com (ID: %)', target_user_id;
    ELSE
        RAISE NOTICE 'No user found with email iw@sdcarealty.com';
    END IF;
END $$;
