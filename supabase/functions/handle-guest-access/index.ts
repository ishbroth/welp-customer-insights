
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.18.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { now, addHours, toISOString } from "../_shared/dateUtils.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[HANDLE-GUEST-ACCESS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { sessionId, accessToken, reviewId } = await req.json();
    
    if (!sessionId || !accessToken || !reviewId) {
      throw new Error("Missing required parameters: sessionId, accessToken, or reviewId");
    }

    logStep("Request parameters", { sessionId, reviewId, accessToken: "present" });

    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Verify the payment session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    logStep("Payment verified", { paymentStatus: session.payment_status });

    // Create Supabase client with service role key
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Check if access record already exists to prevent duplicates
    const { data: existingAccess } = await supabase
      .from('guest_access')
      .select('id')
      .eq('access_token', accessToken)
      .maybeSingle();

    if (existingAccess) {
      logStep("Access record already exists", { accessToken: "present" });
      return new Response(JSON.stringify({ success: true, message: "Access already granted" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Create guest access record with 24-hour expiration (DST-safe)
    const expiresAt = addHours(now(), 24);

    const { data: accessRecord, error: accessError } = await supabase
      .from('guest_access')
      .insert({
        access_token: accessToken,
        review_id: reviewId,
        stripe_session_id: sessionId,
        expires_at: toISOString(expiresAt)
      })
      .select()
      .single();

    if (accessError) {
      logStep("ERROR creating access record", { error: accessError });
      throw new Error(`Failed to create access record: ${accessError.message}`);
    }

    logStep("Guest access record created", {
      accessId: accessRecord.id,
      expiresAt: toISOString(expiresAt),
      reviewId
    });

    return new Response(JSON.stringify({
      success: true,
      accessId: accessRecord.id,
      expiresAt: toISOString(expiresAt)
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in handle-guest-access", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
