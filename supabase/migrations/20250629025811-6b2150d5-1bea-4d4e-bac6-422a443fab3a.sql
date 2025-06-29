
-- Hard delete all reviews and related data
DELETE FROM public.responses;
DELETE FROM public.review_photos;
DELETE FROM public.review_reports;
DELETE FROM public.review_claim_history;
DELETE FROM public.user_review_notifications;
DELETE FROM public.reviews;

-- Reset any sequences or counters if needed
-- This ensures clean state for new reviews
