
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
  console.log(`[CREATE-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {   
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started", { method: req.method, url: req.url });
    
    // Get Stripe key from environment variables
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("ERROR: STRIPE_SECRET_KEY is not set");
      return new Response(JSON.stringify({ error: "STRIPE_SECRET_KEY is not configured" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
    logStep("Stripe key verified");

    // Parse request body
    let requestData;
    try {
      requestData = await req.json();
      logStep("Request body parsed", requestData);
    } catch (e) {
      logStep("ERROR: Failed to parse request body", { error: e.message });
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const { customerId, reviewId, amount = 300, isMobile = false } = requestData;
    logStep("Request data extracted", { customerId, reviewId, amount, isMobile });

    // Initialize Stripe
    let stripe;
    try {
      stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
      logStep("Stripe initialized");
    } catch (e) {
      logStep("ERROR: Failed to initialize Stripe", { error: e.message });
      return new Response(JSON.stringify({ error: "Failed to initialize Stripe" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("ERROR: No authorization header");
      return new Response(JSON.stringify({ error: "Authorization required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) {
      logStep("ERROR: Authentication failed", { error: userError.message });
      return new Response(JSON.stringify({ error: `Authentication error: ${userError.message}` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    
    const user = userData.user;
    if (!user?.email) {
      logStep("ERROR: User not authenticated or email not available");
      return new Response(JSON.stringify({ error: "User not authenticated or email not available" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Handle Stripe customer
    let stripeCustomerId;
    try {
      const customers = await stripe.customers.list({
        email: user.email,
        limit: 1,
      });

      if (customers.data.length > 0) {
        stripeCustomerId = customers.data[0].id;
        logStep("Found existing Stripe customer", { stripeCustomerId });
      } else {
        const newCustomer = await stripe.customers.create({
          email: user.email,
          metadata: { user_id: user.id }
        });
        stripeCustomerId = newCustomer.id;
        logStep("Created new Stripe customer", { stripeCustomerId });
      }
    } catch (e) {
      logStep("ERROR: Stripe customer operation failed", { error: e.message });
      return new Response(JSON.stringify({ error: "Failed to handle Stripe customer" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // Use custom URL scheme for mobile apps, web origin for web
    const origin = isMobile ? "welpapp://" : (req.headers.get("origin") || "https://www.mywelp.com");

    // Prepare success URL with parameters
    const successParams = new URLSearchParams();
    if (customerId) successParams.append("customerId", customerId);
    if (reviewId) successParams.append("reviewId", reviewId);
    successParams.append("success", "true");
    successParams.append("session_id", "{CHECKOUT_SESSION_ID}");

    const successUrl = isMobile
      ? `${origin}profile?${successParams.toString()}`
      : `${origin}/profile?${successParams.toString()}`;
    const cancelUrl = isMobile
      ? `${origin}profile?canceled=true`
      : `${origin}/profile?canceled=true`;
    
    logStep("URLs prepared", { successUrl, cancelUrl, origin });
    
    // Create a one-time payment checkout session
    const sessionConfig = {
      customer: stripeCustomerId,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: reviewId 
                ? "One-Time Review Access" 
                : "One-Time Customer Profile Access",
              description: reviewId 
                ? "Access to view and respond to a specific review" 
                : "Access to all reviews for a specific customer"
            },
            unit_amount: amount, // in cents, so $3.00
          },
          quantity: 1,
        },
      ],
      mode: "payment" as const,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        reviewId: reviewId || "",
        customerId: customerId || "",
        userId: user.id
      }
    };

    logStep("Creating checkout session", { hasCustomer: !!stripeCustomerId, sessionConfig });

    let session;
    try {
      session = await stripe.checkout.sessions.create(sessionConfig);
      logStep("Created payment session", { sessionId: session.id, hasUrl: !!session.url });
    } catch (e) {
      logStep("ERROR: Failed to create Stripe session", { error: e.message, stack: e.stack });
      return new Response(JSON.stringify({ error: `Failed to create checkout session: ${e.message}` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    if (!session.url) {
      logStep("ERROR: No URL returned from Stripe session");
      return new Response(JSON.stringify({ error: "No checkout URL returned from Stripe" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    logStep("Returning successful response", { url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-payment", { message: errorMessage, stack: error instanceof Error ? error.stack : undefined });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
