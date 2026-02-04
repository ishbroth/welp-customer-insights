-- Migration: Add Yitch Promotions feature tables
-- Date: 2026-02-04
-- Description: Creates yitch_promotion_log and customer_promotion_preferences tables,
--   adds promotion preference columns to notification_preferences

-- 1. Create yitch_promotion_log table to track Yitch Customer promotions
CREATE TABLE IF NOT EXISTS public.yitch_promotion_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  target_type TEXT NOT NULL CHECK (target_type IN ('yitch_customers', 'your_customers')),
  location_filter JSONB,
  min_rating INTEGER,
  max_rating INTEGER,
  recipient_count INTEGER,
  campaign_id UUID REFERENCES public.promotional_campaigns(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create customer_promotion_preferences table
CREATE TABLE IF NOT EXISTS public.customer_promotion_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  allow_all_promotions BOOLEAN DEFAULT true,
  allow_claimed_business_promotions BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Add promotion preference columns to notification_preferences if not present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'notification_preferences'
      AND column_name = 'allow_yitch_promotions'
  ) THEN
    ALTER TABLE public.notification_preferences
      ADD COLUMN allow_yitch_promotions BOOLEAN DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'notification_preferences'
      AND column_name = 'allow_claimed_business_promotions'
  ) THEN
    ALTER TABLE public.notification_preferences
      ADD COLUMN allow_claimed_business_promotions BOOLEAN DEFAULT true;
  END IF;
END $$;

-- 4. Add image_urls column to promotional_campaigns if not present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'promotional_campaigns'
      AND column_name = 'image_urls'
  ) THEN
    ALTER TABLE public.promotional_campaigns
      ADD COLUMN image_urls TEXT[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'promotional_campaigns'
      AND column_name = 'target_type'
  ) THEN
    ALTER TABLE public.promotional_campaigns
      ADD COLUMN target_type TEXT DEFAULT 'your_customers';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'promotional_campaigns'
      AND column_name = 'location_filter'
  ) THEN
    ALTER TABLE public.promotional_campaigns
      ADD COLUMN location_filter JSONB;
  END IF;
END $$;

-- 5. Enable RLS on new tables
ALTER TABLE public.yitch_promotion_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_promotion_preferences ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for yitch_promotion_log
CREATE POLICY "Business owners can view their own promotion logs"
  ON public.yitch_promotion_log
  FOR SELECT
  USING (business_id = auth.uid());

CREATE POLICY "Business owners can insert their own promotion logs"
  ON public.yitch_promotion_log
  FOR INSERT
  WITH CHECK (business_id = auth.uid());

-- 7. RLS Policies for customer_promotion_preferences
CREATE POLICY "Users can view their own promotion preferences"
  ON public.customer_promotion_preferences
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own promotion preferences"
  ON public.customer_promotion_preferences
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own promotion preferences"
  ON public.customer_promotion_preferences
  FOR UPDATE
  USING (user_id = auth.uid());

-- 8. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_yitch_promotion_log_business_id
  ON public.yitch_promotion_log(business_id);

CREATE INDEX IF NOT EXISTS idx_yitch_promotion_log_sent_at
  ON public.yitch_promotion_log(sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_customer_promotion_preferences_user_id
  ON public.customer_promotion_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_profiles_city_type
  ON public.profiles(city, type) WHERE type = 'customer';

CREATE INDEX IF NOT EXISTS idx_profiles_zipcode_type
  ON public.profiles(zipcode, type) WHERE type = 'customer';
