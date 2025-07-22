
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
    console.log("🔍 Verify-email-code function called");
    
    const requestData = await req.json();
    console.log("📋 Request data:", { 
      email: requestData.email, 
      code: requestData.code ? "***" : undefined,
      accountType: requestData.accountType 
    });
    
    const { email, code, accountType, userData } = requestData;

    // Simple validation
    if (!email) {
      console.error("❌ Email is required");
      throw new Error("Email address is required");
    }

    if (!code) {
      console.error("❌ Verification code is required");
      throw new Error("Verification code is required");
    }

    if (!accountType) {
      console.error("❌ Account type is required");
      throw new Error("Account type is required");
    }

    console.log(`🎯 Processing verification for email: ${email}, account type: ${accountType}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("❌ Missing Supabase configuration");
      throw new Error("Database configuration not properly set up");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log("✅ Supabase client initialized");

    // Check if the verification code is valid
    try {
      const { data, error: dbError } = await supabase
        .from("verification_codes")
        .select("*")
        .eq("email", email)
        .eq("code", code)
        .eq("verification_type", "email")
        .gt("expires_at", new Date().toISOString())
        .single();
      
      if (dbError || !data) {
        console.log("❌ Invalid or expired verification code:", { 
          hasData: !!data, 
          error: dbError?.message 
        });
        
        return new Response(
          JSON.stringify({ 
            success: false, 
            isValid: false, 
            message: "Invalid or expired verification code"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      console.log("✅ Valid verification code found");
      
      // Remove the used code
      const { error: deleteError } = await supabase
        .from("verification_codes")
        .delete()
        .eq("email", email)
        .eq("verification_type", "email");
      
      if (deleteError) {
        console.error("⚠️ Error deleting used code:", deleteError);
      }
      
      // Note: In a real application, this would create the user account
      // or link the verified email to an existing account
      // This is a simplified placeholder implementation
      
      console.log("✅ Email verification successful");
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          isValid: true,
          message: "Email verified successfully",
          userData: {
            ...userData,
            email_verified: true
          }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
      
    } catch (dbError) {
      console.error("❌ Database error during verification:", dbError);
      throw new Error("Database error during verification");
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("💥 Error in verify-email-code function:", errorMessage);
    console.error("🔍 Full error:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        isValid: false,
        message: errorMessage,
        debug: {
          timestamp: new Date().toISOString(),
          userAgent: req.headers.get('user-agent'),
          referer: req.headers.get('referer')
        }
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
