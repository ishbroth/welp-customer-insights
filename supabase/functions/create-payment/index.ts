
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

// Generate secure random token for guest access
const generateAccessToken = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
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
    if (!stripeKey) {
      logStep("ERROR: STRIPE_SECRET_KEY is not set");
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    logStep("Stripe key verified");

    // Parse request body
    const { customerId, reviewId, amount = 300, isGuest = false } = await req.json();
    logStep("Request data", { customerId, reviewId, amount, isGuest });

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    let user = null;
    let userEmail = "guest@example.com"; // Default for guest users
    let accessToken = null;

    // Generate access token for guest users
    if (isGuest) {
      accessToken = generateAccessToken();
      logStep("Generated access token for guest", { tokenLength: accessToken.length });
    }

    // Handle authentication for non-guest users
    if (!isGuest) {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        logStep("ERROR: No authorization header for authenticated user");
        throw new Error("No authorization header provided for authenticated user");
      }
      logStep("Authorization header found for authenticated user");
      
      // Create Supabase client with service role key for secure operations
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      );

      // Get the authenticated user
      const token = authHeader.replace("Bearer ", "");
      const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
      if (userError) {
        logStep("ERROR: Authentication failed", { error: userError.message });
        throw new Error(`Authentication error: ${userError.message}`);
      }
      
      user = userData.user;
      if (!user?.email) {
        logStep("ERROR: User not authenticated or email not available");
        throw new Error("User not authenticated or email not available");
      }
      userEmail = user.email;
      logStep("User authenticated", { userId: user.id, email: user.email });
    } else {
      logStep("Processing guest payment");
    }

    // For guest users, don't create or look up a Stripe customer
    let stripeCustomerId;
    if (!isGuest) {
      // Check if a customer already exists in Stripe (for non-guest users)
      const customers = await stripe.customers.list({
        email: userEmail,
        limit: 1,
      });

      if (customers.data.length > 0) {
        stripeCustomerId = customers.data[0].id;
        logStep("Found existing Stripe customer", { stripeCustomerId });
      } else {
        const newCustomer = await stripe.customers.create({
          email: userEmail,
          metadata: user ? { user_id: user.id } : {}
        });
        stripeCustomerId = newCustomer.id;
        logStep("Created new Stripe customer", { stripeCustomerId });
      }
    }

    const origin = req.headers.get("origin") || "http://localhost:5173";
    
    // Prepare success URL with parameters to identify what was purchased - FIXED URLS
    const successParams = new URLSearchParams();
    if (customerId) successParams.append("customerId", customerId);
    if (reviewId) successParams.append("reviewId", reviewId);
    successParams.append("success", "true");
    if (accessToken) successParams.append("token", accessToken);
    // Add session_id parameter placeholder - Stripe will replace this
    successParams.append("session_id", "{CHECKOUT_SESSION_ID}");
    
    const successUrl = `${origin}/one-time-review-access?${successParams.toString()}`;
    const cancelUrl = `${origin}/one-time-review-access?reviewId=${reviewId}&canceled=true`;
    
    logStep("URLs prepared", { successUrl, cancelUrl });
    
    // Create a one-time payment checkout session
    const sessionConfig: any = {
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
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        reviewId: reviewId || "",
        customerId: customerId || "",
        isGuest: isGuest.toString(),
        accessToken: accessToken || ""
      }
    };

    // Add customer info for non-guest users
    if (!isGuest && stripeCustomerId) {
      sessionConfig.customer = stripeCustomerId;
    } else if (!isGuest) {
      sessionConfig.customer_email = userEmail;
    }
    // For guest users, don't set customer or customer_email - Stripe will handle it

    logStep("Creating checkout session", { sessionConfig: { ...sessionConfig, line_items: "..." } });

    const session = await stripe.checkout.sessions.create(sessionConfig);

    logStep("Created payment session", { sessionId: session.id, url: session.url, isGuest, accessToken: accessToken ? "present" : "none" });

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
