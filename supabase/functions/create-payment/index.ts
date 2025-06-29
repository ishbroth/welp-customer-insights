
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
    logStep("Function started");
    
    // Get Stripe key from environment variables
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    // Parse request body
    const { customerId, reviewId, amount = 300, isGuest = false } = await req.json();
    logStep("Request data", { customerId, reviewId, amount, isGuest });

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    let user = null;
    let userEmail = "guest@example.com"; // Default for guest users

    // Handle authentication for non-guest users
    if (!isGuest) {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) throw new Error("No authorization header provided for authenticated user");
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
      if (userError) throw new Error(`Authentication error: ${userError.message}`);
      
      user = userData.user;
      if (!user?.email) throw new Error("User not authenticated or email not available");
      userEmail = user.email;
      logStep("User authenticated", { userId: user.id, email: user.email });
    } else {
      logStep("Processing guest payment");
    }

    // Check if a customer already exists in Stripe (for non-guest users)
    let stripeCustomerId;
    if (!isGuest) {
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
    
    // Prepare success URL with parameters to identify what was purchased
    const successParams = new URLSearchParams();
    if (customerId) successParams.append("customerId", customerId);
    if (reviewId) successParams.append("reviewId", reviewId);
    successParams.append("success", "true");
    
    const successUrl = `${origin}/one-time-review?${successParams.toString()}`;
    const cancelUrl = `${origin}/one-time-review?reviewId=${reviewId}&canceled=true`;
    
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
        isGuest: isGuest.toString()
      }
    };

    // Add customer info for non-guest users
    if (!isGuest && stripeCustomerId) {
      sessionConfig.customer = stripeCustomerId;
    } else if (!isGuest) {
      sessionConfig.customer_email = userEmail;
    }
    // For guest users, don't set customer or customer_email - Stripe will handle it

    const session = await stripe.checkout.sessions.create(sessionConfig);

    logStep("Created payment session", { sessionId: session.id, isGuest });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[CREATE-PAYMENT] Error: ${errorMessage}`);
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
