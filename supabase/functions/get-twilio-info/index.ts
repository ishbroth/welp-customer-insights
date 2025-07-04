
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    console.log("🔍 Getting Twilio account information");
    
    // Get Twilio credentials
    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    
    if (!accountSid || !authToken) {
      console.error("❌ Missing Twilio configuration");
      throw new Error("Twilio credentials not properly configured");
    }
    
    console.log("✅ Twilio credentials found");
    
    // Fetch account information from Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}.json`;
    const auth = btoa(`${accountSid}:${authToken}`);
    
    const response = await fetch(twilioUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Twilio API error:", response.status, errorText);
      throw new Error(`Twilio API error: ${response.status}`);
    }
    
    const accountData = await response.json();
    console.log("✅ Account data retrieved successfully");
    
    return new Response(
      JSON.stringify({ 
        success: true,
        accountInfo: {
          accountSid: accountData.sid,
          friendlyName: accountData.friendly_name,
          status: accountData.status,
          type: accountData.type,
          dateCreated: accountData.date_created,
          ownerAccountSid: accountData.owner_account_sid
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("💥 Error getting Twilio info:", errorMessage);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: errorMessage
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
