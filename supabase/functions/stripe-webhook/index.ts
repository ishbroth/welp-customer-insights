import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.18.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");
    
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    const body = await req.text();
    const signature = req.headers.get("stripe-signature") || "";
    
    // For now, we'll process without signature verification for testing
    // In production, add webhook endpoint secret validation
    const event = JSON.parse(body);
    
    logStep("Processing event", { type: event.type, eventId: event.id });

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        logStep("Checkout session completed", { sessionId: session.id });
        
        if (session.mode === "subscription") {
          const customer = await stripe.customers.retrieve(session.customer);
          const subscription = await stripe.subscriptions.retrieve(session.subscription);
          
          // Get user type from session metadata or customer metadata
          const userType = session.metadata?.user_type || customer.metadata?.user_type || 'customer';
          
          logStep("Updating subscription record", { 
            email: customer.email, 
            userType, 
            subscriptionId: subscription.id 
          });

          // Update subscribers table
          await supabaseClient.from("subscribers").upsert({
            email: customer.email,
            stripe_customer_id: customer.id,
            subscribed: true,
            subscription_tier: userType === "business" ? "Business Premium" : "Customer Premium",
            subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
            user_type: userType,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'email' });
          
          logStep("Subscription record updated successfully");
        }
        break;
      }
      
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const customer = await stripe.customers.retrieve(subscription.customer);
        
        const isActive = subscription.status === 'active';
        const subscriptionEnd = isActive ? 
          new Date(subscription.current_period_end * 1000).toISOString() : null;
        
        logStep("Subscription status changed", { 
          email: customer.email, 
          status: subscription.status,
          isActive 
        });

        await supabaseClient.from("subscribers")
          .update({
            subscribed: isActive,
            subscription_end: subscriptionEnd,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', customer.id);
          
        logStep("Subscription status updated in database");
        break;
      }
      
      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in webhook", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});