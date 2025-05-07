
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Twilio } from "https://esm.sh/twilio@4.23.0";

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Define interface for request body
interface SendSmsRequest {
  phoneNumber: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get Twilio credentials from environment variables
    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (!accountSid || !authToken || !twilioPhoneNumber) {
      console.error("Missing Twilio credentials");
      return new Response(
        JSON.stringify({
          error: "Server configuration error: Missing Twilio credentials",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse request body
    const { phoneNumber }: SendSmsRequest = await req.json();

    if (!phoneNumber) {
      return new Response(
        JSON.stringify({ error: "Phone number is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Format phone number (remove spaces, dashes, etc.)
    const formattedPhoneNumber = phoneNumber.replace(/\D/g, "");
    
    // Generate a random 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Initialize Twilio client
    const client = new Twilio(accountSid, authToken);
    
    // Send SMS
    const message = await client.messages.create({
      body: `Your Welp verification code is: ${verificationCode}`,
      from: twilioPhoneNumber,
      to: formattedPhoneNumber.startsWith("+") ? formattedPhoneNumber : `+1${formattedPhoneNumber}`,
    });
    
    console.log(`SMS sent with SID: ${message.sid} to ${phoneNumber}`);
    
    // Return success response with the verification code
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Verification code sent successfully",
        verificationCode: verificationCode, // Return the code for development/testing
        messageSid: message.sid
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error sending SMS:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to send verification SMS",
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
