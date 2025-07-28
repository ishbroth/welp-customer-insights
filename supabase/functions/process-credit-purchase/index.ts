
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.18.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROCESS-CREDIT-PURCHASE] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { sessionId, chargeId } = await req.json();
    
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    let creditQuantity = 1;
    let sessionOrChargeId = sessionId;
    
    if (sessionId) {
      // Handle checkout session
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      logStep("Retrieved checkout session", { sessionId, status: session.payment_status });

      if (session.payment_status !== 'paid') {
        throw new Error("Payment not completed");
      }

      // Get the line items to determine how many credits were purchased
      const lineItems = await stripe.checkout.sessions.listLineItems(sessionId);
      creditQuantity = lineItems.data[0]?.quantity || 1;
      logStep("Determined credit quantity from session", { creditQuantity });
    } else if (chargeId) {
      // Handle direct charge ID (for existing transactions)
      const charge = await stripe.charges.retrieve(chargeId);
      logStep("Retrieved charge", { chargeId, status: charge.status, amount: charge.amount });
      
      if (charge.status !== 'succeeded') {
        throw new Error("Charge not successful");
      }
      
      // Calculate credits based on amount (300 cents = $3 = 1 credit)
      creditQuantity = Math.floor(charge.amount / 300);
      sessionOrChargeId = chargeId;
      logStep("Determined credit quantity from charge", { creditQuantity, amount: charge.amount });
    } else {
      throw new Error("Either sessionId or chargeId is required");
    }

    // Check if we've already processed this transaction
    const { data: existingTransaction } = await supabaseClient
      .from('credit_transactions')
      .select('id')
      .eq('stripe_session_id', sessionOrChargeId)
      .eq('user_id', user.id)
      .single();

    if (existingTransaction) {
      logStep("Transaction already processed", { transactionId: existingTransaction.id });
      return new Response(JSON.stringify({ 
        success: true, 
        credits: creditQuantity,
        message: `Credits already applied for this transaction`,
        alreadyProcessed: true
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Update user credits using the database function
    const { error: creditError } = await supabaseClient.rpc('update_user_credits', {
      p_user_id: user.id,
      p_amount: creditQuantity,
      p_type: 'purchase',
      p_description: `Purchased ${creditQuantity} credits`,
      p_stripe_session_id: sessionOrChargeId
    });

    if (creditError) {
      logStep("Error updating credits", { error: creditError });
      throw new Error(`Failed to update credits: ${creditError.message}`);
    }

    logStep("Successfully processed credit purchase", { userId: user.id, credits: creditQuantity });

    return new Response(JSON.stringify({ 
      success: true, 
      credits: creditQuantity,
      message: `Successfully purchased ${creditQuantity} credits!`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
