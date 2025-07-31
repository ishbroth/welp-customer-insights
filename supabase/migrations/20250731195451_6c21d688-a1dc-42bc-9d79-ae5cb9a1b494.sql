-- Issue manual refund for missed automatic refund for review 3333cd13-4068-4b8c-b972-1eb26da8977b
-- This review was deleted but the user ab7280c4-7fe1-49c6-9f5b-89fc9770fa50 did not receive their credit refund

SELECT public.update_user_credits(
  'ab7280c4-7fe1-49c6-9f5b-89fc9770fa50'::uuid,
  1,
  'refund',
  'Manual refund: Review 3333cd13-4068-4b8c-b972-1eb26da8977b deleted (missed automatic refund)',
  NULL
);