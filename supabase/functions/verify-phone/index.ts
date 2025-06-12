
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
    console.log("Verify-phone function called");
    
    const requestData = await req.json();
    console.log("Request data:", { ...requestData, code: requestData.code ? "***" : undefined });
    
    const { phoneNumber, code, actionType } = requestData;

    // Simple validation
    if (!phoneNumber) {
      console.error("Phone number is required");
      throw new Error("Phone number is required");
    }

    if (!actionType) {
      console.error("Action type is required");
      throw new Error("Action type is required");
    }

    console.log(`Processing ${actionType} action for phone: ${phoneNumber}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase configuration");
      throw new Error("Database configuration not properly set up");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log("Supabase client initialized");

    // Initialize Twilio client
    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const fromNumber = Deno.env.get("TWILIO_PHONE_NUMBER");
    
    if (!accountSid || !authToken || !fromNumber) {
      console.error("Missing Twilio configuration:", { 
        accountSid: !!accountSid, 
        authToken: !!authToken, 
        fromNumber: !!fromNumber 
      });
      throw new Error("Twilio credentials not properly configured");
    }
    
    console.log("Twilio configuration verified");
    
    // Import and initialize Twilio with proper error handling
    let twilioClient;
    try {
      // Use direct import instead of dynamic import
      const { default: Twilio } = await import("https://esm.sh/twilio@5.2.2");
      twilioClient = new Twilio(accountSid, authToken);
      console.log("Twilio client initialized successfully");
    } catch (twilioError) {
      console.error("Failed to initialize Twilio:", twilioError);
      throw new Error(`Failed to initialize SMS service: ${twilioError.message}`);
    }
    
    // Clean phone number (remove non-digits and ensure it starts with +1 for US numbers)
    let cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length === 10) {
      cleanPhone = '+1' + cleanPhone;
    } else if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) {
      cleanPhone = '+' + cleanPhone;
    } else if (!cleanPhone.startsWith('+')) {
      cleanPhone = '+1' + cleanPhone;
    }
    console.log("Cleaned phone number:", cleanPhone);
    
    // For actionType "send" we send a verification code
    if (actionType === "send") {
      console.log("Sending verification code");
      
      // Generate a random 6-digit code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      console.log("Generated verification code");
      
      // Store the code in the verification_codes table
      try {
        const { error: dbError } = await supabase
          .from("verification_codes")
          .upsert({
            phone: cleanPhone,
            code: verificationCode,
            expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 min expiry
          }, { onConflict: 'phone' });
        
        if (dbError) {
          console.error("Database error:", dbError);
          throw new Error(`Database error: ${dbError.message}`);
        }
        
        console.log("Verification code stored in database");
      } catch (dbError) {
        console.error("Failed to store verification code:", dbError);
        throw new Error("Failed to store verification code in database");
      }
      
      // Send SMS using Twilio
      try {
        console.log(`Attempting to send SMS to ${cleanPhone}`);
        
        const message = await twilioClient.messages.create({
          body: `Your Welp verification code is: ${verificationCode}. It expires in 10 minutes.`,
          from: fromNumber,
          to: cleanPhone
        });
        
        console.log(`SMS sent successfully. Message SID: ${message.sid}`);
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `Verification code sent to ${phoneNumber}` 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
        
      } catch (twilioError) {
        console.error("Twilio error details:", {
          message: twilioError.message,
          code: twilioError.code,
          moreInfo: twilioError.moreInfo,
          status: twilioError.status
        });
        
        // Return a more specific error message based on Twilio error
        let errorMessage = "Failed to send verification code";
        if (twilioError.code === 21211) {
          errorMessage = "Invalid phone number format";
        } else if (twilioError.code === 21614) {
          errorMessage = "Invalid phone number - unable to send to this number";
        } else if (twilioError.code === 21408) {
          errorMessage = "Permission denied - check Twilio account settings";
        }
        
        throw new Error(`${errorMessage}: ${twilioError.message}`);
      }
    } 
    else if (actionType === "verify") {
      console.log("Verifying code");
      
      if (!code) {
        console.error("Verification code is required");
        throw new Error("Verification code is required");
      }
      
      // Check if the code is valid and not expired
      try {
        const { data, error: dbError } = await supabase
          .from("verification_codes")
          .select("*")
          .eq("phone", cleanPhone)
          .eq("code", code)
          .gt("expires_at", new Date().toISOString())
          .single();
        
        if (dbError || !data) {
          console.log("Invalid or expired verification code:", { 
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
        
        console.log("Valid verification code found");
        
        // Remove the used code
        const { error: deleteError } = await supabase
          .from("verification_codes")
          .delete()
          .eq("phone", cleanPhone);
        
        if (deleteError) {
          console.error("Error deleting used code:", deleteError);
          // Don't fail the verification, just log the error
        }
        
        console.log("Verification successful");
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            isValid: true, 
            message: "Phone number verified successfully"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
        
      } catch (dbError) {
        console.error("Database error during verification:", dbError);
        throw new Error("Database error during verification");
      }
    } else {
      console.error("Invalid action type:", actionType);
      throw new Error("Invalid action type");
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in verify-phone function:", errorMessage);
    console.error("Full error:", error);
    
    return new Response(
      JSON.stringify({ success: false, message: errorMessage }),
      { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
