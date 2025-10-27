
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[REVENUECAT-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    // Parse webhook payload
    const event = await req.json();
    logStep("Event type", { type: event.type });

    // Create Supabase client with service role
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get user ID from event
    const appUserId = event.event.app_user_id;
    if (!appUserId) {
      throw new Error("No app_user_id in event");
    }

    logStep("Processing for user", { userId: appUserId });

    // Handle different event types
    switch (event.type) {
      case "INITIAL_PURCHASE":
      case "RENEWAL":
      case "NON_RENEWING_PURCHASE":
        await handlePurchase(supabaseClient, event, appUserId);
        break;

      case "CANCELLATION":
      case "EXPIRATION":
        await handleCancellation(supabaseClient, event, appUserId);
        break;

      case "BILLING_ISSUE":
        await handleBillingIssue(supabaseClient, event, appUserId);
        break;

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[REVENUECAT-WEBHOOK] Error: ${errorMessage}`);

    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function handlePurchase(supabaseClient: any, event: any, userId: string) {
  logStep("Handling purchase", { userId });

  const productId = event.event.product_id;
  const expiresDate = event.event.expiration_at_ms
    ? new Date(event.event.expiration_at_ms)
    : null;

  // Determine subscription type
  let subscriptionTier = "premium";
  let isLifetime = false;

  if (productId.includes("lifetime") || productId.includes("legacy")) {
    subscriptionTier = "lifetime";
    isLifetime = true;
  }

  // Update or create billing record
  const { data: existingBilling, error: fetchError } = await supabaseClient
    .from("billing")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchError && fetchError.code !== "PGRST116") {
    throw fetchError;
  }

  const billingData = {
    user_id: userId,
    subscribed: true,
    subscription_tier: subscriptionTier,
    subscription_end_date: isLifetime ? null : expiresDate,
    payment_provider: "apple",
    apple_product_id: productId,
    updated_at: new Date().toISOString(),
  };

  if (existingBilling) {
    // Update existing record
    const { error: updateError } = await supabaseClient
      .from("billing")
      .update(billingData)
      .eq("user_id", userId);

    if (updateError) throw updateError;
    logStep("Billing record updated", { userId });
  } else {
    // Create new record
    const { error: insertError } = await supabaseClient
      .from("billing")
      .insert(billingData);

    if (insertError) throw insertError;
    logStep("Billing record created", { userId });
  }

  // For consumable purchases (credits), add credits
  if (productId.includes("credit")) {
    await addCreditsToUser(supabaseClient, userId, 1);
  }
}

async function handleCancellation(supabaseClient: any, event: any, userId: string) {
  logStep("Handling cancellation", { userId });

  const expiresDate = event.event.expiration_at_ms
    ? new Date(event.event.expiration_at_ms)
    : new Date();

  // Update billing record - keep subscription active until expiration
  const { error } = await supabaseClient
    .from("billing")
    .update({
      subscription_end_date: expiresDate,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (error) throw error;
  logStep("Cancellation processed", { userId, expiresDate });
}

async function handleBillingIssue(supabaseClient: any, event: any, userId: string) {
  logStep("Handling billing issue", { userId });

  // Update billing record to mark as having issues
  const { error } = await supabaseClient
    .from("billing")
    .update({
      subscription_status: "payment_failed",
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (error) throw error;
  logStep("Billing issue recorded", { userId });
}

async function addCreditsToUser(supabaseClient: any, userId: string, amount: number) {
  logStep("Adding credits", { userId, amount });

  // Get current balance
  const { data: creditsData, error: fetchError } = await supabaseClient
    .from("credits")
    .select("balance")
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchError && fetchError.code !== "PGRST116") {
    throw fetchError;
  }

  const currentBalance = creditsData?.balance || 0;
  const newBalance = currentBalance + amount;

  if (creditsData) {
    // Update existing
    const { error: updateError } = await supabaseClient
      .from("credits")
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq("user_id", userId);

    if (updateError) throw updateError;
  } else {
    // Create new
    const { error: insertError } = await supabaseClient
      .from("credits")
      .insert({ user_id: userId, balance: newBalance });

    if (insertError) throw insertError;
  }

  // Create credit transaction
  const { error: txError } = await supabaseClient
    .from("credit_transactions")
    .insert({
      user_id: userId,
      amount: amount,
      transaction_type: "purchase",
      description: "Apple IAP credit purchase",
      payment_provider: "apple",
    });

  if (txError) throw txError;

  logStep("Credits added successfully", { userId, newBalance });
}
