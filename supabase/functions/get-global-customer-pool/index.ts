import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Content-Type': 'application/json'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    const { city, zipCodes, minRating } = await req.json();

    // Build query for customer profiles
    let query = supabase
      .from('profiles')
      .select('id, city, zipcode')
      .eq('type', 'customer');

    // Apply location filters
    if (city) {
      query = query.ilike('city', city);
    } else if (zipCodes && zipCodes.length > 0) {
      query = query.in('zipcode', zipCodes);
    }

    const { data: customers, error: customersError } = await query;

    if (customersError) {
      throw customersError;
    }

    if (!customers || customers.length === 0) {
      return new Response(
        JSON.stringify({ starBreakdown: [], totalCount: 0, filteredCount: 0 }),
        { headers: corsHeaders }
      );
    }

    const customerIds = customers.map(c => c.id);

    // Get customers who have opted out of all promotions
    const { data: optedOut } = await supabase
      .from('customer_promotion_preferences')
      .select('user_id')
      .in('user_id', customerIds)
      .eq('allow_all_promotions', false);

    const optedOutIds = new Set((optedOut || []).map(o => o.user_id));

    // Also check notification_preferences for allow_yitch_promotions
    const { data: notifPrefs } = await supabase
      .from('notification_preferences')
      .select('user_id, allow_yitch_promotions')
      .in('user_id', customerIds)
      .eq('allow_yitch_promotions', false);

    const notifOptedOutIds = new Set((notifPrefs || []).map(n => n.user_id));

    // Filter out opted-out customers
    const eligibleIds = customerIds.filter(
      id => !optedOutIds.has(id) && !notifOptedOutIds.has(id)
    );

    if (eligibleIds.length === 0) {
      return new Response(
        JSON.stringify({ starBreakdown: [], totalCount: 0, filteredCount: 0 }),
        { headers: corsHeaders }
      );
    }

    // Get reviews to calculate star breakdown
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('rating')
      .is('deleted_at', null);

    if (reviewsError) {
      throw reviewsError;
    }

    const totalCount = eligibleIds.length;

    // Build star breakdown from review data
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    if (reviews) {
      for (const review of reviews) {
        const bucket = Math.min(5, Math.max(1, Math.round(review.rating)));
        ratingCounts[bucket]++;
      }
    }

    const starBreakdown = [
      { rating: 5, label: '5 stars', count: ratingCounts[5] },
      { rating: 4, label: '4 stars', count: ratingCounts[4] },
      { rating: 3, label: '3 stars', count: ratingCounts[3] },
      { rating: 2, label: '2 stars', count: ratingCounts[2] },
      { rating: 1, label: '1 star', count: ratingCounts[1] },
    ];

    // Calculate filtered count based on minRating
    let filteredCount = totalCount;
    if (minRating && minRating > 1) {
      const minAvg = minRating - 0.5;
      const thresholdBuckets = [5, 4, 3, 2].filter(r => (r - 0.5) >= minAvg);
      filteredCount = thresholdBuckets.reduce((sum, r) => sum + ratingCounts[r], 0);
      filteredCount = Math.min(filteredCount, totalCount);
    }

    return new Response(
      JSON.stringify({ starBreakdown, totalCount, filteredCount }),
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error fetching global customer pool:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch customer pool' }),
      { status: 500, headers: corsHeaders }
    );
  }
});
