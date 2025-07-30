import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.18.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper function for logging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROCESS-PAYMENT-REFUND] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    
    // Get Stripe key from environment variables
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    // Get request data
    const { sessionId } = await req.json();
    if (!sessionId) throw new Error("Session ID is required");
    logStep("Request data", { sessionId });

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    logStep("Retrieved checkout session", { sessionId: session.id, status: session.payment_status });

    // Verify payment was successful
    if (session.payment_status !== 'paid') {
      throw new Error("Payment not completed successfully");
    }

    // Get user info and credit balance from metadata
    const userId = session.metadata?.user_id;
    const creditBalance = parseInt(session.metadata?.credit_balance || '0');
    const paymentType = session.metadata?.payment_type;
    
    if (!userId) throw new Error("User ID not found in session metadata");
    logStep("Session metadata", { userId, creditBalance, paymentType });

    // If no credits to refund, return success
    if (creditBalance <= 0) {
      logStep("No credits to refund", { creditBalance });
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Payment processed successfully - no credits to refund" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Create Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Calculate refund amount
    const creditValueInCents = creditBalance * 300; // $3 per credit in cents
    let refundAmount = creditValueInCents;
    
    // For subscription, cap refund at the payment amount
    if (paymentType === "subscription") {
      refundAmount = Math.min(creditValueInCents, 1199); // Cap at $11.99
    }
    // For legacy payment, cap refund at the payment amount
    else if (paymentType === "legacy") {
      refundAmount = Math.min(creditValueInCents, 25000); // Cap at $250
    }

    logStep("Refund calculation", { 
      creditBalance, 
      creditValueInCents, 
      refundAmount,
      paymentType 
    });

    // Create a refund via Stripe
    const paymentIntentId = session.payment_intent as string;
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: refundAmount,
      metadata: {
        user_id: userId,
        credit_balance: creditBalance.toString(),
        payment_type: paymentType || 'unknown'
      }
    });

    logStep("Created Stripe refund", { refundId: refund.id, amount: refundAmount });

    // Calculate how many credits to consume (based on actual refund amount)
    const creditsToConsume = Math.ceil(refundAmount / 300);
    
    // Only consume credits after successful refund
    const { error: creditError } = await supabaseClient.rpc('update_user_credits', {
      p_user_id: userId,
      p_amount: -creditsToConsume,
      p_type: paymentType === 'subscription' ? 'subscription_refund' : 'legacy_refund',
      p_description: `Credits applied via refund for ${paymentType} payment (${creditsToConsume} credits = $${(refundAmount / 100).toFixed(2)} refund)`,
      p_stripe_session_id: sessionId
    });

    if (creditError) {
      logStep("Error consuming credits after refund", { error: creditError });
      // Note: Refund was successful, but credit consumption failed
      // This should be handled by manual intervention or retry logic
      throw new Error("Refund processed but failed to consume credits - manual review required");
    }

    logStep("Successfully processed payment and refund", { 
      refundId: refund.id, 
      creditsConsumed: creditsToConsume,
      refundAmount
    });

    return new Response(JSON.stringify({ 
      success: true, 
      refundId: refund.id,
      refundAmount: refundAmount / 100, // Convert to dollars
      creditsConsumed: creditsToConsume,
      message: `Payment processed successfully. Refunded $${(refundAmount / 100).toFixed(2)} for ${creditsToConsume} credit${creditsToConsume === 1 ? '' : 's'}.`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in process-payment-refund", { error: errorMessage });
    
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});