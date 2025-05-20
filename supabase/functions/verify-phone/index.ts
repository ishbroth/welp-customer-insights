
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.0";
import { Twilio } from "https://esm.sh/twilio@4.26.1";

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

    // Initialize Twilio client
    const twilioClient = new Twilio(
      Deno.env.get("TWILIO_ACCOUNT_SID") ?? "",
      Deno.env.get("TWILIO_AUTH_TOKEN") ?? ""
    );
    
    const fromNumber = Deno.env.get("TWILIO_PHONE_NUMBER") ?? "";
    
    // For actionType "send" we send a verification code
    // For actionType "verify" we verify the code
    if (actionType === "send") {
      // Generate a random 6-digit code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      
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
      
      // Send SMS using Twilio
      try {
        console.log(`Sending verification code to ${phoneNumber}`);
        
        await twilioClient.messages.create({
          body: `Your Welp verification code is: ${verificationCode}. It expires in 10 minutes.`,
          from: fromNumber,
          to: phoneNumber
        });
        
        console.log(`Verification code sent successfully to ${phoneNumber}`);
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `Verification code sent to ${phoneNumber}` 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (twilioError) {
        console.error("Twilio error:", twilioError);
        throw new Error(`Failed to send verification code: ${twilioError.message}`);
      }
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
    console.error("Error in verify-phone function:", errorMessage);
    
    return new Response(
      JSON.stringify({ success: false, message: errorMessage }),
      { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
