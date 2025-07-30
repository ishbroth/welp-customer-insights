
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.18.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-LEGACY-PAYMENT] ${step}${detailsStr}`);
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

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");
    
    // Create Supabase client with service role key for secure operations
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get the authenticated user
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Request body contains info like user type
    const { userType = "customer" } = await req.json();
    logStep("Request data", { userType });

    // Check user's credit balance
    const { data: creditsData, error: creditsError } = await supabaseClient
      .from('credits')
      .select('balance')
      .eq('user_id', user.id)
      .maybeSingle();

    const creditBalance = creditsData?.balance || 0;
    const creditValueInCents = creditBalance * 300; // $3 per credit in cents
    logStep("User credit balance", { creditBalance, creditValueInCents });

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check if a customer already exists in Stripe
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    // Get or create customer
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing Stripe customer", { customerId });
    } else {
      const newCustomer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
          user_type: userType
        }
      });
      customerId = newCustomer.id;
      logStep("Created new Stripe customer", { customerId });
    }

    // Set up the price for Legacy plan - $250 one-time payment
    const baseAmount = 25000;  // $250 in cents
    const discountAmount = Math.min(creditValueInCents, baseAmount);
    const finalAmount = Math.max(0, baseAmount - discountAmount);
    
    logStep("Pricing calculation", { 
      baseAmount, 
      creditValueInCents, 
      discountAmount, 
      finalAmount,
      creditsToApply: creditBalance
    });
    
    const origin = req.headers.get("origin") || "http://localhost:5173";
    
    // Apply credits if user has any and consume them
    if (creditBalance > 0 && discountAmount > 0) {
      logStep("Applying credits to legacy payment", { creditsToConsume: creditBalance, discountAmount });
      
      // Consume all credits since this is a one-time payment
      const { error: creditError } = await supabaseClient.rpc('update_user_credits', {
        p_user_id: user.id,
        p_amount: -creditBalance,
        p_type: 'legacy_applied',
        p_description: `Credits applied to ${userType} legacy plan (${creditBalance} credits = $${(discountAmount / 100).toFixed(2)} discount)`
      });
      
      if (creditError) {
        logStep("Error consuming credits", { error: creditError });
        throw new Error("Failed to apply credits to legacy payment");
      }
    }
    
    // Create a one-time payment session for Legacy plan
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: userType === "business" ? "Business Legacy Plan" : "Customer Legacy Plan",
              description: userType === "business" 
                ? "Lifetime access to all customer reviews and business tools - never expires!" 
                : "Lifetime access to all reviews about you and response capabilities - never expires!"
            },
            unit_amount: finalAmount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/profile?legacy=true`,
      cancel_url: `${origin}/subscription?canceled=true`,
      metadata: {
        user_id: user.id,
        user_type: userType,
        payment_type: "legacy",
        credits_applied: creditBalance.toString(),
        original_amount: baseAmount.toString(),
        discount_amount: discountAmount.toString()
      }
    });

    logStep("Created legacy payment session", { sessionId: session.id });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[CREATE-LEGACY-PAYMENT] Error: ${errorMessage}`);
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
