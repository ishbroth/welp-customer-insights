-- Fix extract_negative_quip to have a comprehensive phrase detection list
-- The current function has a very limited set of phrases, causing most real reviews
-- to fall back to the generic "Stay away" quip.

CREATE OR REPLACE FUNCTION public.extract_negative_quip(review_content text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  content_lower text := lower(coalesce(review_content, ''));
BEGIN
  -- Priority 1: Fraud / financial deception (most serious)
  IF content_lower ~ 'scam\s+artist' THEN RETURN 'Scam artist'; END IF;
  IF content_lower ~ 'identity\s+theft' THEN RETURN 'Identity theft'; END IF;
  IF content_lower ~ 'credit\s+card\s+fraud' THEN RETURN 'Credit card fraud'; END IF;
  IF content_lower ~ 'fraudulent\s+check' OR content_lower ~ 'fake\s+check' OR content_lower ~ 'bad\s+check' THEN RETURN 'Wrote bad checks'; END IF;
  IF content_lower ~ 'counterfeit' THEN RETURN 'Used counterfeits'; END IF;
  IF content_lower ~ 'embezzle' THEN RETURN 'Embezzler'; END IF;
  IF content_lower ~ 'fraud' THEN RETURN 'Fraudster'; END IF;
  IF content_lower ~ 'forgery|forged' THEN RETURN 'Forger'; END IF;

  -- Priority 2: Theft / stealing
  IF content_lower ~ 'shoplift' THEN RETURN 'Shoplifter'; END IF;
  IF content_lower ~ 'stole\s+from|stolen\s+from|stealing\s+from' THEN RETURN 'Thief'; END IF;
  IF content_lower ~ 'caught\s+stealing' THEN RETURN 'Caught stealing'; END IF;
  IF content_lower ~ 'steal|stole|stolen|theft' THEN RETURN 'Thief'; END IF;

  -- Priority 3: Physical threats / danger
  IF content_lower ~ 'assault|attacked|physical' AND content_lower ~ 'threat|violen' THEN RETURN 'Physically threatening'; END IF;
  IF content_lower ~ 'threaten|threatened|threats' THEN RETURN 'Made threats'; END IF;
  IF content_lower ~ 'stalking|stalked|stalker' THEN RETURN 'Stalker'; END IF;
  IF content_lower ~ 'harass|harassment' THEN RETURN 'Harasser'; END IF;
  IF content_lower ~ 'intimidat' THEN RETURN 'Intimidating'; END IF;
  IF content_lower ~ 'vandali' THEN RETURN 'Vandal'; END IF;
  IF content_lower ~ 'destroyed|destruction|damage' AND content_lower ~ 'property|equipment|vehicle' THEN RETURN 'Property damage'; END IF;

  -- Priority 4: Verbal abuse / aggressive behavior
  IF content_lower ~ 'verbally\s+abusi' THEN RETURN 'Verbally abusive'; END IF;
  IF content_lower ~ 'verbal\s+abuse' THEN RETURN 'Verbally abusive'; END IF;
  IF content_lower ~ 'screamed|screaming|yelling|yelled' THEN RETURN 'Screamer'; END IF;
  IF content_lower ~ 'curs(ed|ing)\s+(at|out)' THEN RETURN 'Foul-mouthed'; END IF;
  IF content_lower ~ 'profanit|vulgar|obscen' THEN RETURN 'Vulgar'; END IF;
  IF content_lower ~ 'racial\s+slur|racist' THEN RETURN 'Racist'; END IF;
  IF content_lower ~ 'sexist|misogyn|sexual\s+harass' THEN RETURN 'Sexual harassment'; END IF;
  IF content_lower ~ 'abusive' THEN RETURN 'Abusive'; END IF;
  IF content_lower ~ 'hostile|hostility' THEN RETURN 'Hostile'; END IF;
  IF content_lower ~ 'aggressive' THEN RETURN 'Aggressive'; END IF;
  IF content_lower ~ 'belligeren' THEN RETURN 'Belligerent'; END IF;

  -- Priority 5: Scams / deception
  IF content_lower ~ 'set\s+(us|me|them|you|businesses)\s+up' THEN RETURN 'Sets people up'; END IF;
  IF content_lower ~ 'setting\s+(us|me|them|you|businesses)\s+up' THEN RETURN 'Sets people up'; END IF;
  IF content_lower ~ 'scam(s|med|ming)?' AND content_lower ~ 'business' THEN RETURN 'Scams businesses'; END IF;
  IF content_lower ~ 'scam' THEN RETURN 'Scammer'; END IF;
  IF content_lower ~ 'con\s+artist|con\s+man|con\s+woman' THEN RETURN 'Con artist'; END IF;
  IF content_lower ~ 'swindl' THEN RETURN 'Swindler'; END IF;
  IF content_lower ~ 'extort' THEN RETURN 'Extortionist'; END IF;
  IF content_lower ~ 'blackmail' THEN RETURN 'Blackmailer'; END IF;
  IF content_lower ~ 'bait\s+and\s+switch' THEN RETURN 'Bait and switch'; END IF;
  IF content_lower ~ 'rip\s*off|ripped\s*(us|me|them)?\s*off' THEN RETURN 'Rip-off artist'; END IF;
  IF content_lower ~ 'price\s+goug' THEN RETURN 'Price gouger'; END IF;

  -- Priority 6: Lying / dishonesty
  IF content_lower ~ 'pathological\s+liar' THEN RETURN 'Pathological liar'; END IF;
  IF content_lower ~ 'compulsive\s+liar' THEN RETURN 'Compulsive liar'; END IF;
  IF content_lower ~ 'lied\s+to\s+(us|me|my|our|the|staff)' THEN RETURN 'Lied to us'; END IF;
  IF content_lower ~ 'lied\s+about' THEN RETURN 'Liar'; END IF;
  IF content_lower ~ 'lies\s+about|lying\s+about|lying\s+to' THEN RETURN 'Liar'; END IF;
  IF content_lower ~ 'lied|liar|lies' THEN RETURN 'Liar'; END IF;
  IF content_lower ~ 'dishonest' THEN RETURN 'Dishonest'; END IF;
  IF content_lower ~ 'deceiv|deceit|decepti' THEN RETURN 'Deceitful'; END IF;
  IF content_lower ~ 'mislead|misled|misleading' THEN RETURN 'Misleading'; END IF;
  IF content_lower ~ 'manipulat' THEN RETURN 'Manipulative'; END IF;
  IF content_lower ~ 'fake\s+(credentials|membership|id|identity|story|stories)' THEN RETURN 'Uses fakes'; END IF;
  IF content_lower ~ 'fake\s+review|false\s+review|fake\s+complaint' THEN RETURN 'Fake reviewer'; END IF;
  IF content_lower ~ 'false\s+accusation|falsely\s+accus|false\s+claim' THEN RETURN 'False accuser'; END IF;
  IF content_lower ~ 'made\s+up\s+(complaint|story|stories|excuse|claim)' THEN RETURN 'Makes things up'; END IF;
  IF content_lower ~ 'fabricat' THEN RETURN 'Fabricator'; END IF;

  -- Priority 7: Payment issues
  IF content_lower ~ 'refused\s+to\s+pay' OR content_lower ~ 'refuses\s+to\s+pay' THEN RETURN 'Refused to pay'; END IF;
  IF content_lower ~ 'never\s+paid' OR content_lower ~ 'didn''t\s+pay' OR content_lower ~ 'did\s+not\s+pay' THEN RETURN 'Never paid'; END IF;
  IF content_lower ~ 'skip(ped)?\s+(out|on)\s+(the\s+)?(bill|tab|check|payment)' THEN RETURN 'Skipped on the bill'; END IF;
  IF content_lower ~ 'dine\s+and\s+dash|dined\s+and\s+dashed' THEN RETURN 'Dine and dash'; END IF;
  IF content_lower ~ 'chargeback|charge\s*back|disputed\s+(the\s+)?charge' THEN RETURN 'Disputed charges'; END IF;
  IF content_lower ~ 'bounced\s+check' THEN RETURN 'Bounced check'; END IF;
  IF content_lower ~ 'paid\s+late|late\s+pay(ment|ing|er)|delayed\s+pay' THEN RETURN 'Paid late'; END IF;
  IF content_lower ~ 'not\s+pay|won''t\s+pay|wouldn''t\s+pay' THEN RETURN 'Won''t pay'; END IF;
  IF content_lower ~ 'tried\s+to\s+not\s+pay|tried\s+not\s+to\s+pay' THEN RETURN 'Tried to not pay'; END IF;
  IF content_lower ~ 'underpaid|under\s*paid|short\s*changed' THEN RETURN 'Underpaid'; END IF;
  IF content_lower ~ 'haggl|cheap(skate)?|penny\s+pinch|lowball' THEN RETURN 'Cheapskate'; END IF;
  IF content_lower ~ 'stiff(ed)?\s+(us|me|the|our|on)' THEN RETURN 'Stiffed us'; END IF;

  -- Priority 8: Attitude / behavior problems
  IF content_lower ~ 'complete\s+nightmare' THEN RETURN 'Complete nightmare'; END IF;
  IF content_lower ~ 'nightmare\s+(customer|client|person|to\s+work)' THEN RETURN 'Nightmare customer'; END IF;
  IF content_lower ~ 'nightmare' THEN RETURN 'Nightmare'; END IF;
  IF content_lower ~ 'worst\s+(customer|client|person|experience)' THEN RETURN 'Worst customer'; END IF;
  IF content_lower ~ 'bully|bullied|bullying' THEN RETURN 'Bully'; END IF;
  IF content_lower ~ 'entitled' THEN RETURN 'Entitled'; END IF;
  IF content_lower ~ 'narcissis' THEN RETURN 'Narcissist'; END IF;
  IF content_lower ~ 'condescend' THEN RETURN 'Condescending'; END IF;
  IF content_lower ~ 'arrogant|arrogance' THEN RETURN 'Arrogant'; END IF;
  IF content_lower ~ 'obnoxious' THEN RETURN 'Obnoxious'; END IF;
  IF content_lower ~ 'rude|rudeness' THEN RETURN 'Rude'; END IF;
  IF content_lower ~ 'disrespect' THEN RETURN 'Disrespectful'; END IF;
  IF content_lower ~ 'belittl' THEN RETURN 'Belittling'; END IF;
  IF content_lower ~ 'demean' THEN RETURN 'Demeaning'; END IF;
  IF content_lower ~ 'patroniz' THEN RETURN 'Patronizing'; END IF;
  IF content_lower ~ 'dismiss(ive)?' AND content_lower ~ '(staff|employee|worker|team|us|me)' THEN RETURN 'Dismissive'; END IF;
  IF content_lower ~ 'argumentative|always\s+argu' THEN RETURN 'Argumentative'; END IF;
  IF content_lower ~ 'combative|confrontation' THEN RETURN 'Combative'; END IF;
  IF content_lower ~ 'difficult\s+to\s+work' OR content_lower ~ 'extremely\s+difficult' THEN RETURN 'Extremely difficult'; END IF;
  IF content_lower ~ 'impossible\s+to\s+(work|deal|please|satisfy)' THEN RETURN 'Impossible to please'; END IF;
  IF content_lower ~ 'unreasonable' THEN RETURN 'Unreasonable'; END IF;
  IF content_lower ~ 'demanding|outrageous\s+demand' THEN RETURN 'Overly demanding'; END IF;
  IF content_lower ~ 'micromanag' THEN RETURN 'Micromanager'; END IF;
  IF content_lower ~ 'control\s+freak|controlling' THEN RETURN 'Control freak'; END IF;
  IF content_lower ~ 'impatient|no\s+patience' THEN RETURN 'Impatient'; END IF;
  IF content_lower ~ 'bossy' THEN RETURN 'Bossy'; END IF;
  IF content_lower ~ 'pushy' THEN RETURN 'Pushy'; END IF;
  IF content_lower ~ 'mean(\s+spirited|-spirited)?' AND content_lower ~ '(staff|employee|worker|team|us|me|people)' THEN RETURN 'Mean-spirited'; END IF;
  IF content_lower ~ 'nasty' THEN RETURN 'Nasty'; END IF;
  IF content_lower ~ 'toxic' THEN RETURN 'Toxic'; END IF;

  -- Priority 9: Reliability / professionalism issues
  IF content_lower ~ 'no\s*show|no-show|didn''t\s+show|never\s+showed' THEN RETURN 'No-show'; END IF;
  IF content_lower ~ 'stood\s+(us|me)\s+up' THEN RETURN 'Stood us up'; END IF;
  IF content_lower ~ 'ghost(ed|ing)?' AND content_lower ~ '(us|me|appointment|project|job)' THEN RETURN 'Ghosted us'; END IF;
  IF content_lower ~ 'constant(ly)?\s+(cancel|reschedul)' THEN RETURN 'Constant canceller'; END IF;
  IF content_lower ~ 'always\s+late|never\s+on\s+time|chronically\s+late' THEN RETURN 'Always late'; END IF;
  IF content_lower ~ '(30|45|60)\s+minutes?\s+late|hour(s)?\s+late' THEN RETURN 'Shows up late'; END IF;
  IF content_lower ~ 'wasted?\s+(our|my)\s+time' THEN RETURN 'Time waster'; END IF;
  IF content_lower ~ 'unreliable' THEN RETURN 'Unreliable'; END IF;
  IF content_lower ~ 'unprofessional' THEN RETURN 'Unprofessional'; END IF;
  IF content_lower ~ 'irresponsible' THEN RETURN 'Irresponsible'; END IF;
  IF content_lower ~ 'careless' THEN RETURN 'Careless'; END IF;
  IF content_lower ~ 'neglect' THEN RETURN 'Negligent'; END IF;
  IF content_lower ~ 'incompetent' THEN RETURN 'Incompetent'; END IF;
  IF content_lower ~ 'uncooperat' THEN RETURN 'Uncooperative'; END IF;

  -- Priority 10: Complaints / trouble-making
  IF content_lower ~ 'complain(s|ed|er|ing)?\s+(about\s+)?every' OR content_lower ~ 'constant(ly)?\s+complain' THEN RETURN 'Chronic complainer'; END IF;
  IF content_lower ~ 'complain(s|ed|er|ing)' THEN RETURN 'Complainer'; END IF;
  IF content_lower ~ 'karen' THEN RETURN 'Total Karen'; END IF;
  IF content_lower ~ 'threaten.*sue|sued|lawsuit|lawyer|attorney|legal\s+action' THEN RETURN 'Lawsuit threat'; END IF;
  IF content_lower ~ 'threat.*report|report.*(bbb|health\s+dept|better\s+business)' THEN RETURN 'Threatens reports'; END IF;
  IF content_lower ~ 'left.*negative.*review|bad.*review.*online|yelp.*review|google.*review' THEN RETURN 'Retaliatory reviewer'; END IF;
  IF content_lower ~ 'slander|defam|libel' THEN RETURN 'Slanderous'; END IF;
  IF content_lower ~ 'ruin(ed|ing)?\s+(our|my|the)\s+(reputation|business|name)' THEN RETURN 'Reputation destroyer'; END IF;
  IF content_lower ~ 'spread(ing)?\s+(lies|rumors|false)' THEN RETURN 'Rumor spreader'; END IF;
  IF content_lower ~ 'called\s+the\s+(cops|police)' AND content_lower ~ '(false|no\s+reason|nothing|lie)' THEN RETURN 'False police reports'; END IF;

  -- Priority 11: Substance / safety concerns
  IF content_lower ~ 'drunk|intoxicat|inebriat' THEN RETURN 'Showed up drunk'; END IF;
  IF content_lower ~ 'drug|high|under\s+the\s+influence' AND NOT content_lower ~ 'drug\s*store|pharmacy' THEN RETURN 'Under the influence'; END IF;
  IF content_lower ~ 'smok(ed|ing)\s+(inside|in\s+(the|our|my))' THEN RETURN 'Smoked inside'; END IF;

  -- Priority 12: Hygiene / property concerns
  IF content_lower ~ 'filthy|disgust|gross|unsanitary' THEN RETURN 'Disgusting'; END IF;
  IF content_lower ~ 'left\s+(a\s+)?mess|trashed|destroyed' AND content_lower ~ '(place|room|area|space|property)' THEN RETURN 'Left a mess'; END IF;
  IF content_lower ~ 'bed\s*bug|cockroach|infestat' THEN RETURN 'Brought pests'; END IF;
  IF content_lower ~ 'hoard' THEN RETURN 'Hoarder'; END IF;

  -- Priority 13: Scope creep / unfair expectations
  IF content_lower ~ 'scope\s+creep|kept\s+adding|more\s+and\s+more\s+work' THEN RETURN 'Scope creeper'; END IF;
  IF content_lower ~ 'moved?\s+the\s+goalpost|changing\s+(the\s+)?requirement' THEN RETURN 'Moves goalposts'; END IF;
  IF content_lower ~ 'expect(s|ed)?\s+(free|something\s+for\s+nothing|miracle)' THEN RETURN 'Expects freebies'; END IF;
  IF content_lower ~ 'want(s|ed)?\s+(it|everything)\s+for\s+(free|nothing)' THEN RETURN 'Wants everything free'; END IF;
  IF content_lower ~ 'last\s+minute\s+change|changed\s+(everything|their\s+mind)\s+(at|last)' THEN RETURN 'Last-minute changes'; END IF;
  IF content_lower ~ 'never\s+satisfied|nothing.*good\s+enough|impossible\s+to\s+please' THEN RETURN 'Never satisfied'; END IF;

  -- Priority 14: General negative catch-alls (weaker signals)
  IF content_lower ~ 'cannot\s+be\s+trusted|can''t\s+be\s+trusted|untrustworthy|do\s+not\s+trust' THEN RETURN 'Untrustworthy'; END IF;
  IF content_lower ~ 'banned|kicked\s+out|barred|blacklist' THEN RETURN 'Banned'; END IF;
  IF content_lower ~ 'worst' THEN RETURN 'The worst'; END IF;
  IF content_lower ~ 'avoid\s+(at\s+all\s+costs?|this|him|her|them)' THEN RETURN 'Avoid at all costs'; END IF;
  IF content_lower ~ 'do\s+not\s+recommend|would\s+not\s+recommend|wouldn''t\s+recommend' THEN RETURN 'Do not recommend'; END IF;
  IF content_lower ~ 'will\s+not\s+work\s+with|never\s+again|never\s+work\s+with' THEN RETURN 'Never again'; END IF;
  IF content_lower ~ 'terrible|awful|horrible|dreadful|atrocious' THEN RETURN 'Terrible'; END IF;
  IF content_lower ~ 'bad' THEN RETURN 'Bad customer'; END IF;
  IF content_lower ~ 'unpleasant' THEN RETURN 'Unpleasant'; END IF;
  IF content_lower ~ 'not\s+worth' THEN RETURN 'Not worth it'; END IF;

  -- Default fallback
  RETURN 'Stay away';
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.extract_negative_quip(text) TO anon, authenticated, service_role;
