
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
    const { userId, name, phone, address, city, state, zipCode, type, businessName } = await req.json();
    
    // Simple validation
    if (!userId || !type) {
      throw new Error("User ID and account type are required");
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    // Create a profile record in the profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        name: name,
        phone: phone,
        address: address,
        city: city,
        state: state,
        zipcode: zipCode,
        type: type,
        created_at: new Date().toISOString(),
      });

    if (profileError) {
      console.error("Profile creation error:", profileError);
      throw new Error(`Failed to create profile: ${profileError.message}`);
    }

    // If it's a business account, create business info record
    if (type === "business" && businessName) {
      const { error: businessError } = await supabase
        .from('business_info')
        .insert({
          id: userId,
          business_name: businessName,
        });

      if (businessError) {
        console.error("Business info creation error:", businessError);
        throw new Error(`Failed to create business info: ${businessError.message}`);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Profile created successfully" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in create-profile function:", errorMessage);
    
    return new Response(
      JSON.stringify({ success: false, message: errorMessage }),
      { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
