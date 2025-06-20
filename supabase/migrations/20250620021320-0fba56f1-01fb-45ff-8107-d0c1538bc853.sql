
-- Delete all responses first (since they reference reviews)
DELETE FROM public.responses;

-- Delete all review photos
DELETE FROM public.review_photos;

-- Delete all review reports
DELETE FROM public.review_reports;

-- Delete all review claim history
DELETE FROM public.review_claim_history;

-- Delete all user review notifications
DELETE FROM public.user_review_notifications;

-- Finally delete all reviews
DELETE FROM public.reviews;
