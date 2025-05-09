
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
    const requestData = await req.json();
    const { phoneNumber, code, actionType } = requestData;

    // Simple validation
    if (!phoneNumber) {
      throw new Error("Phone number is required");
    }

    // For actionType "send" we send a verification code
    // For actionType "verify" we verify the code
    if (actionType === "send") {
      // Generate a random 6-digit code for demo purposes
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // In a real implementation, this would use Twilio, AWS SNS, or similar service
      // to actually send the SMS with the code
      
      // For demo, we'll just store the code in a database
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );
      
      // Store the code in a verification_codes table
      const { error } = await supabase
        .from("verification_codes")
        .upsert({
          phone: phoneNumber.replace(/\D/g, ''), // Remove non-digits
          code: verificationCode,
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 min expiry
        }, { onConflict: 'phone' });
      
      if (error) {
        throw error;
      }
      
      console.log(`Sending code ${verificationCode} to ${phoneNumber}`);
      
      return new Response(
        JSON.stringify({ success: true, message: `Verification code sent to ${phoneNumber}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } 
    else if (actionType === "verify") {
      if (!code) {
        throw new Error("Verification code is required");
      }
      
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );
      
      // Check if the code is valid and not expired
      const { data, error } = await supabase
        .from("verification_codes")
        .select("*")
        .eq("phone", phoneNumber.replace(/\D/g, ''))
        .eq("code", code)
        .gt("expires_at", new Date().toISOString())
        .single();
      
      if (error || !data) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            isValid: false, 
            message: "Invalid or expired verification code"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Valid code found
      // Remove the used code
      await supabase
        .from("verification_codes")
        .delete()
        .eq("phone", phoneNumber.replace(/\D/g, ''));
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          isValid: true, 
          message: "Phone number verified successfully"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      throw new Error("Invalid action type");
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, message: errorMessage }),
      { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
