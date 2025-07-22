
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.0";
import { Resend } from "npm:resend@2.0.0";

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
    console.log("📧 Send-email-verification-code function called");
    
    const requestData = await req.json();
    console.log("📋 Request data:", { email: requestData.email });
    
    const { email } = requestData;

    // Validate email
    if (!email) {
      console.error("❌ Email is required");
      throw new Error("Email address is required");
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("❌ Missing Supabase configuration");
      throw new Error("Database configuration not properly set up");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log("✅ Supabase client initialized");

    // Initialize Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("❌ Missing Resend API key");
      throw new Error("Email service not properly configured");
    }

    const resend = new Resend(resendApiKey);
    console.log("✅ Resend client initialized");

    // Generate a random 6-digit code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("🔢 Generated verification code");

    // Store the code in the verification_codes table
    try {
      const { error: dbError } = await supabase
        .from("verification_codes")
        .upsert({
          email: email,
          code: verificationCode,
          verification_type: 'email',
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 min expiry
        }, { onConflict: 'email' });
      
      if (dbError) {
        console.error("❌ Database error:", dbError);
        throw new Error(`Database error: ${dbError.message}`);
      }
      
      console.log("💾 Verification code stored in database");
    } catch (dbError) {
      console.error("❌ Failed to store verification code:", dbError);
      throw new Error("Failed to store verification code in database");
    }

    // Send email using Resend
    try {
      console.log(`📨 Attempting to send email to ${email}`);
      
      const emailResult = await resend.emails.send({
        from: 'Welp. <noreply@resend.dev>',
        to: [email],
        subject: 'Your Welp. Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #ea384c; margin: 0;">Welp.</h1>
              <p style="color: #666; margin: 5px 0;">Verify your email address</p>
            </div>
            
            <div style="background: #f8f9fa; border-radius: 8px; padding: 30px; text-align: center; margin-bottom: 20px;">
              <h2 style="color: #333; margin-bottom: 15px;">Your verification code is:</h2>
              <div style="font-size: 32px; font-weight: bold; color: #ea384c; letter-spacing: 8px; margin: 20px 0; font-family: monospace;">
                ${verificationCode}
              </div>
            </div>
            
            <div style="text-align: center; color: #666; font-size: 14px;">
              <p>This code will expire in 10 minutes.</p>
              <p>If you didn't request this verification, you can safely ignore this email.</p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 12px;">
              <p>© 2024 Welp. - Because businesses are people too</p>
            </div>
          </div>
        `,
      });

      if (emailResult.error) {
        console.error("❌ Resend error:", emailResult.error);
        throw new Error(`Failed to send email: ${emailResult.error.message}`);
      }

      console.log("✅ Email sent successfully");
      console.log("📊 Email ID:", emailResult.data?.id);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Verification code sent to ${email}`,
          debug: {
            provider: "Resend",
            emailId: emailResult.data?.id
          }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } catch (emailError) {
      console.error("❌ Email sending error:", emailError);
      throw new Error(`Failed to send verification email: ${emailError.message}`);
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("💥 Error in send-email-verification-code function:", errorMessage);
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
