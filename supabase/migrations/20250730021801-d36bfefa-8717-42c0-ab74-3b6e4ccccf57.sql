-- Manual credit restoration for isaac.wiley99@gmail.com (retroactive refund)
-- This user purchased a credit, used it on a review that was later deleted
-- before the automatic refund system was implemented

SELECT update_user_credits(
  'ab7280c4-7fe1-49c6-9f5b-89fc9770fa50'::uuid,
  1,
  'refund',
  'Retroactive refund: Review deleted before refund system implemented'
);