
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.0";
import { now, addMinutes, toISOString } from "../_shared/dateUtils.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();
    
    if (!email) {
      throw new Error("Email is required");
    }

    console.log("Sending verification code to:", email);

    // Initialize Supabase client with service role key
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Generate a 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = addMinutes(now(), 10); // Expires in 10 minutes (DST-safe)

    // Store the verification code in the database
    const { error: dbError } = await supabase
      .from('email_verification_codes')
      .upsert({
        email: email,
        code: code,
        expires_at: toISOString(expiresAt),
        used: false
      }, {
        onConflict: 'email'
      });

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error("Failed to store verification code");
    }

    // Send email using Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Welp <onboarding@resend.dev>",
        to: [email],
        subject: "Your Welp Verification Code",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333; text-align: center;">Verify Your Email</h2>
            <p style="font-size: 16px; color: #555;">
              Thank you for signing up! Please use the verification code below to complete your registration:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="background-color: #f5f5f5; padding: 15px 25px; font-size: 24px; font-weight: bold; letter-spacing: 3px; border-radius: 5px; display: inline-block;">${code}</span>
            </div>
            <p style="font-size: 14px; color: #777;">
              This code will expire in 10 minutes. If you didn't request this code, please ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 12px; color: #999; text-align: center;">
              This email was sent by Welp. Please do not reply to this email.
            </p>
          </div>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Resend API error:", errorText);
      throw new Error(`Failed to send email: ${errorText}`);
    }

    const emailResult = await emailResponse.json();
    console.log("Email sent successfully:", emailResult);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Verification code sent to ${email}`,
        debug: {
          provider: "Resend",
          emailId: emailResult.id
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to send verification code";
    console.error("❌ ERROR in send-email-verification-code:", errorMessage);
    console.error("Full error details:", error);

    return new Response(
      JSON.stringify({
        success: false,
        message: errorMessage,
        error: error instanceof Error ? error.stack : String(error)
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
