
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { userId, email } = body;
    
    if (!email && !userId) {
      throw new Error("User ID or email is required");
    }
    
    // Initialize Supabase admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
    
    let userIdToUpdate = userId;
    
    // If only email is provided, get the user ID
    if (!userId && email) {
      const { data: userData, error: fetchError } = await supabaseAdmin.auth.admin.listUsers({
        filter: {
          email: email
        }
      });
      
      if (fetchError || !userData || !userData.users || userData.users.length === 0) {
        throw new Error("User not found with the provided email");
      }
      
      userIdToUpdate = userData.users[0].id;
    }
    
    // Update the user to confirm their email
    const { error } = await supabaseAdmin.auth.admin.updateUserById(
      userIdToUpdate,
      { email_confirm: true }
    );
    
    if (error) {
      throw error;
    }
    
    return new Response(
      JSON.stringify({ success: true, message: "Email confirmed successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error confirming email:", errorMessage);
    
    return new Response(
      JSON.stringify({ success: false, message: errorMessage }),
      { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
