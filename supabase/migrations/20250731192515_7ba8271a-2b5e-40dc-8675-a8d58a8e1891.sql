-- Issue manual refund to isaac.wiley99@gmail.com for deleted review c0c04503-e1d9-40e2-85c2-35e8be8e6b7e
-- This corrects the missed automatic refund due to a bug in the delete-review function

SELECT public.update_user_credits(
  'ab7280c4-7fe1-49c6-9f5b-89fc9770fa50'::uuid,
  1,
  'refund',
  'Manual refund: Review c0c04503-e1d9-40e2-85c2-35e8be8e6b7e deleted (missed automatic refund due to pattern matching bug)',
  NULL
);