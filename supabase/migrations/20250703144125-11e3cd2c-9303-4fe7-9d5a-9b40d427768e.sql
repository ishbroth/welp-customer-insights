
-- Disable the auto-relink trigger that's automatically claiming reviews
DROP TRIGGER IF EXISTS on_review_auto_relink ON public.reviews;

-- Keep the function but don't auto-execute it
-- This allows manual re-linking later if needed but stops automatic claiming
