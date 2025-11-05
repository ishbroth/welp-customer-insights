
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
  console.log(`[CREATE-CREDIT-PAYMENT] ${step}${detailsStr}`);
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
          user_id: user.id
        }
      });
      customerId = newCustomer.id;
      logStep("Created new Stripe customer", { customerId });
    }

    // Get credit amount from request body
    const requestBody = await req.json();
    const creditAmount = parseInt(requestBody.creditAmount) || 1;

    // Validate credit amount
    if (creditAmount < 1 || creditAmount > 50) {
      throw new Error(`Invalid credit amount: ${creditAmount}. Must be between 1 and 50.`);
    }

    logStep("Request data", { creditAmount, requestBody });

    const origin = req.headers.get("origin") || "http://localhost:5173";

    // Prepare success URL with parameters to identify what was purchased
    const successParams = new URLSearchParams();
    successParams.append("credits", "true");
    successParams.append("success", "true");
    successParams.append("session_id", "{CHECKOUT_SESSION_ID}");

    const successUrl = `${origin}/profile/billing?${successParams.toString()}`;
    const cancelUrl = `${origin}/profile/billing?canceled=true`;

    // Create a one-time payment checkout session for credits with quantity adjustment enabled
    logStep("Creating Stripe checkout session", {
      creditAmount,
      unitAmount: 300,
      totalAmount: creditAmount * 300
    });

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Welp Credits",
              description: `Each credit costs $3.00 and unlocks one full review with response capabilities`
            },
            unit_amount: 300, // $3.00 per credit in cents
          },
          quantity: creditAmount, // Quantity from frontend (validated above)
          adjustable_quantity: {
            enabled: true,
            minimum: 1,
            maximum: 50 // Allow up to 50 credits per purchase
          }
        },
      ],
      mode: "payment", // This is crucial - one-time payment, not subscription
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        user_id: user.id,
        type: "credit_purchase",
        credit_amount: creditAmount.toString()
      }
    });

    logStep("Created credit payment session", {
      sessionId: session.id,
      sessionUrl: session.url,
      quantity: creditAmount
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[CREATE-CREDIT-PAYMENT] Error: ${errorMessage}`);
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
