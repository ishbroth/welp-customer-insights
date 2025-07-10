
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
    console.log("🔔 Verify-phone function called");
    
    const requestData = await req.json();
    console.log("📋 Request data:", { ...requestData, code: requestData.code ? "***" : undefined });
    
    const { phoneNumber, code, actionType } = requestData;

    // Simple validation
    if (!phoneNumber) {
      console.error("❌ Phone number is required");
      throw new Error("Phone number is required");
    }

    if (!actionType) {
      console.error("❌ Action type is required");
      throw new Error("Action type is required");
    }

    console.log(`🎯 Processing ${actionType} action for phone: ${phoneNumber}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("❌ Missing Supabase configuration");
      throw new Error("Database configuration not properly set up");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log("✅ Supabase client initialized");

    // Get AWS credentials
    const awsAccessKey = Deno.env.get("AWS_ACCESS_KEY_ID");
    const awsSecretKey = Deno.env.get("AWS_SECRET_ACCESS_KEY");
    const awsRegion = Deno.env.get("AWS_REGION");
    const originationNumber = Deno.env.get("AWS_SNS_ORIGINATION_NUMBER");
    
    console.log("🔐 AWS configuration check:", { 
      accessKey: awsAccessKey ? `${awsAccessKey.substring(0, 8)}***` : "MISSING", 
      secretKey: awsSecretKey ? "***PRESENT***" : "MISSING", 
      region: awsRegion || "MISSING",
      originationNumber: originationNumber || "MISSING" 
    });
    
    if (!awsAccessKey || !awsSecretKey || !awsRegion || !originationNumber) {
      console.error("❌ Missing AWS configuration:", { 
        accessKey: !!awsAccessKey, 
        secretKey: !!awsSecretKey, 
        region: !!awsRegion,
        originationNumber: !!originationNumber 
      });
      throw new Error("AWS SNS service not properly configured. Please check your AWS credentials.");
    }
    
    console.log("✅ AWS configuration verified");
    
    // Improved phone number cleaning with URL decoding
    const decodedPhone = decodeURIComponent(phoneNumber);
    console.log("📱 Decoded phone number:", decodedPhone);
    
    let cleanPhone = decodedPhone.replace(/\D/g, '');
    console.log("📱 Digits only:", cleanPhone);
    
    // Convert to E.164 format for AWS SNS
    if (cleanPhone.length === 10) {
      cleanPhone = '+1' + cleanPhone;
    } else if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) {
      cleanPhone = '+' + cleanPhone;
    } else if (!cleanPhone.startsWith('+')) {
      cleanPhone = '+1' + cleanPhone;
    }
    console.log("📱 Final E.164 format:", cleanPhone);
    
    // For actionType "send" we send a verification code
    if (actionType === "send") {
      console.log("📤 Sending verification code via AWS SNS");
      
      // Generate a random 6-digit code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      console.log("🔢 Generated verification code:", verificationCode);
      
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
          console.error("❌ Database error:", dbError);
          throw new Error(`Database error: ${dbError.message}`);
        }
        
        console.log("💾 Verification code stored in database");
      } catch (dbError) {
        console.error("❌ Failed to store verification code:", dbError);
        throw new Error("Failed to store verification code in database");
      }
      
      // Send SMS using AWS SNS
      try {
        console.log(`📨 Attempting to send SMS to ${cleanPhone} via AWS SNS`);
        
        const smsMessage = `Your Welp verification code is: ${verificationCode}. It expires in 10 minutes.`;
        console.log("📝 SMS message prepared");
        
        // Create AWS signature for SNS API call
        const host = `sns.${awsRegion}.amazonaws.com`;
        const endpoint = `https://${host}/`;
        
        const params = new URLSearchParams({
          'Action': 'Publish',
          'PhoneNumber': cleanPhone,
          'Message': smsMessage,
          'MessageAttributes.AWS.SNS.SMS.SenderID.DataType': 'String',
          'MessageAttributes.AWS.SNS.SMS.SenderID.StringValue': 'Welp',
          'Version': '2010-03-31'
        });

        // Add origination number if provided
        if (originationNumber) {
          params.append('MessageAttributes.AWS.SNS.SMS.OriginationNumber.DataType', 'String');
          params.append('MessageAttributes.AWS.SNS.SMS.OriginationNumber.StringValue', originationNumber);
        }
        
        const body = params.toString();
        
        // Create AWS signature v4
        const now = new Date();
        const dateStamp = now.toISOString().slice(0, 10).replace(/-/g, '');
        const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
        
        // Create canonical request
        const canonicalHeaders = `host:${host}\nx-amz-date:${amzDate}\n`;
        const signedHeaders = 'host;x-amz-date';
        
        const canonicalRequest = [
          'POST',
          '/',
          '',
          canonicalHeaders,
          signedHeaders,
          await sha256(body)
        ].join('\n');
        
        // Create string to sign
        const credentialScope = `${dateStamp}/${awsRegion}/sns/aws4_request`;
        const stringToSign = [
          'AWS4-HMAC-SHA256',
          amzDate,
          credentialScope,
          await sha256(canonicalRequest)
        ].join('\n');
        
        // Calculate signature
        const kDate = await hmacSha256(`AWS4${awsSecretKey}`, dateStamp);
        const kRegion = await hmacSha256(kDate, awsRegion);
        const kService = await hmacSha256(kRegion, 'sns');
        const kSigning = await hmacSha256(kService, 'aws4_request');
        const signature = await hmacSha256(kSigning, stringToSign, 'hex');
        
        // Create authorization header
        const authorization = `AWS4-HMAC-SHA256 Credential=${awsAccessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
            'X-Amz-Date': amzDate,
            'Authorization': authorization,
            'Host': host
          },
          body: body
        });
        
        console.log("📡 AWS SNS API response status:", response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("❌ AWS SNS API error:", response.status, errorText);
          throw new Error(`AWS SNS API error: ${response.status} - ${errorText}`);
        }
        
        const responseText = await response.text();
        console.log("✅ SMS sent successfully via AWS SNS");
        console.log("📊 SNS Response:", responseText.substring(0, 200) + "...");
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `Verification code sent to ${phoneNumber}`,
            debug: {
              provider: "AWS SNS",
              cleanedPhone: cleanPhone,
              originationNumber: originationNumber
            }
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
        
      } catch (snsError) {
        console.error("❌ AWS SNS error details:", snsError);
        throw new Error(`Failed to send SMS via AWS SNS: ${snsError.message}`);
      }
    } 
    else if (actionType === "verify") {
      console.log("🔍 Verifying code");
      
      if (!code) {
        console.error("❌ Verification code is required");
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
          .eq("phone", cleanPhone);
        
        if (deleteError) {
          console.error("⚠️ Error deleting used code:", deleteError);
          // Don't fail the verification, just log the error
        }
        
        console.log("✅ Verification successful");
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            isValid: true, 
            message: "Phone number verified successfully"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
        
      } catch (dbError) {
        console.error("❌ Database error during verification:", dbError);
        throw new Error("Database error during verification");
      }
    } else {
      console.error("❌ Invalid action type:", actionType);
      throw new Error("Invalid action type");
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("💥 Error in verify-phone function:", errorMessage);
    console.error("🔍 Full error:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
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

// Helper functions for AWS signature v4
async function sha256(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hmacSha256(key: string | Uint8Array, data: string, encoding: 'hex' | 'raw' = 'raw'): Promise<string | Uint8Array> {
  const encoder = new TextEncoder();
  const keyBuffer = typeof key === 'string' ? encoder.encode(key) : key;
  const dataBuffer = encoder.encode(data);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, dataBuffer);
  const signatureArray = new Uint8Array(signature);
  
  if (encoding === 'hex') {
    return Array.from(signatureArray).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  return signatureArray;
}
