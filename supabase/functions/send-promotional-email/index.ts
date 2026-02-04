import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { sendNotification } from "../_shared/notifications/index.ts";
import { createPromotionalEmail } from "../_shared/notifications/email/templates/promotionalEmail.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Content-Type": "application/json"
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    const {
      businessId,
      campaignId,
      targetType,
      emailContent,
      imageUrls,
      locationFilter,
      minRating,
    } = await req.json();

    if (!businessId || !targetType || !emailContent) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: businessId, targetType, emailContent" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Check weekly limit for yitch_customers
    if (targetType === "yitch_customers") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: recentLogs } = await supabase
        .from("yitch_promotion_log")
        .select("id, sent_at")
        .eq("business_id", businessId)
        .eq("target_type", "yitch_customers")
        .gte("sent_at", sevenDaysAgo.toISOString())
        .limit(1);

      if (recentLogs && recentLogs.length > 0) {
        const lastSent = new Date(recentLogs[0].sent_at);
        const nextAvailable = new Date(lastSent.getTime() + 7 * 24 * 60 * 60 * 1000);
        return new Response(
          JSON.stringify({
            error: "Weekly limit reached",
            nextAvailableDate: nextAvailable.toISOString(),
          }),
          { status: 429, headers: corsHeaders }
        );
      }
    }

    // Get business name
    const { data: businessInfo } = await supabase
      .from("business_info")
      .select("business_name")
      .eq("id", businessId)
      .maybeSingle();

    let businessName = businessInfo?.business_name;

    if (!businessName) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name, name")
        .eq("id", businessId)
        .maybeSingle();

      businessName = profile?.name || [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "A Yitch Business";
    }

    const subjectLine = "Special Yitch Promotion from " + businessName;

    // Get recipient emails based on target type
    let recipientEmails: string[] = [];

    if (targetType === "your_customers") {
      const { data: pool } = await supabase
        .from("business_customer_pool")
        .select("customer_id, customer_email, review_rating")
        .eq("business_id", businessId);

      if (pool) {
        let filtered = pool;
        if (minRating && minRating > 1) {
          const minAvg = minRating - 0.5;
          filtered = pool.filter((c: any) => (c.review_rating || 0) >= minAvg);
        }

        const customerIds = filtered.map((c: any) => c.customer_id);

        const { data: optedOut } = await supabase
          .from("notification_preferences")
          .select("user_id")
          .in("user_id", customerIds)
          .eq("allow_claimed_business_promotions", false);

        const optedOutIds = new Set((optedOut || []).map((o: any) => o.user_id));
        const eligibleIds = customerIds.filter((id: string) => !optedOutIds.has(id));

        const { data: profiles } = await supabase
          .from("profiles")
          .select("email")
          .in("id", eligibleIds)
          .not("email", "is", null);

        recipientEmails = (profiles || []).map((p: any) => p.email).filter(Boolean);
      }
    } else if (targetType === "yitch_customers") {
      let query = supabase
        .from("profiles")
        .select("id, email")
        .eq("type", "customer")
        .not("email", "is", null);

      if (locationFilter?.city) {
        query = query.ilike("city", locationFilter.city);
      } else if (locationFilter?.zipCodes?.length > 0) {
        query = query.in("zipcode", locationFilter.zipCodes);
      }

      const { data: customers } = await query;

      if (customers) {
        const customerIds = customers.map((c: any) => c.id);

        const { data: optedOut } = await supabase
          .from("notification_preferences")
          .select("user_id")
          .in("user_id", customerIds)
          .eq("allow_yitch_promotions", false);

        const optedOutIds = new Set((optedOut || []).map((o: any) => o.user_id));

        const { data: promoOptedOut } = await supabase
          .from("customer_promotion_preferences")
          .select("user_id")
          .in("user_id", customerIds)
          .eq("allow_all_promotions", false);

        const promoOptedOutIds = new Set((promoOptedOut || []).map((o: any) => o.user_id));

        recipientEmails = customers
          .filter((c: any) => !optedOutIds.has(c.id) && !promoOptedOutIds.has(c.id))
          .map((c: any) => c.email)
          .filter(Boolean);
      }
    }

    if (recipientEmails.length === 0) {
      return new Response(
        JSON.stringify({ success: true, sentCount: 0, message: "No eligible recipients found" }),
        { headers: corsHeaders }
      );
    }

    // Build email HTML
    const emailHtml = createPromotionalEmail({
      businessName,
      emailContent,
      imageUrls: imageUrls || [],
      unsubscribeUrl: "https://mywelp.com/notifications",
    });

    // Send emails individually
    let sentCount = 0;

    for (const email of recipientEmails) {
      try {
        const result = await sendNotification({
          to: { email },
          subject: subjectLine,
          emailHtml,
        });
        if (result.success) sentCount++;
      } catch (e) {
        console.error("Error sending to recipient:", e);
      }
    }

    // Update campaign record if provided
    if (campaignId) {
      await supabase
        .from("promotional_campaigns")
        .update({
          sent_at: new Date().toISOString(),
          sent_count: sentCount,
          status: "sent",
          target_type: targetType,
          image_urls: imageUrls || [],
          location_filter: locationFilter || null,
        })
        .eq("id", campaignId);
    }

    // Log to yitch_promotion_log
    await supabase
      .from("yitch_promotion_log")
      .insert({
        business_id: businessId,
        target_type: targetType,
        location_filter: locationFilter || null,
        min_rating: minRating || null,
        recipient_count: sentCount,
        campaign_id: campaignId || null,
      });

    return new Response(
      JSON.stringify({
        success: true,
        sentCount,
        totalRecipients: recipientEmails.length,
      }),
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error sending promotional email:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send promotional emails" }),
      { status: 500, headers: corsHeaders }
    );
  }
});
