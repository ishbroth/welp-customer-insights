
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-BUSINESS] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Verification function started");

    // Get token from URL query parameters
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    
    logStep("Token received", { token });
    
    if (!token) {
      throw new Error("Verification token is required");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Find the verification request
    logStep("Looking up verification request");
    const { data: verificationRequest, error: findError } = await supabaseClient
      .from('verification_requests')
      .select('*')
      .eq('verification_token', token)
      .eq('status', 'pending')
      .single();

    if (findError || !verificationRequest) {
      logStep("Verification request not found", { findError });
      throw new Error("Invalid or expired verification token");
    }

    logStep("Verification request found", { 
      businessName: verificationRequest.business_name,
      userId: verificationRequest.user_id 
    });

    // Update the verification request status
    const { error: updateRequestError } = await supabaseClient
      .from('verification_requests')
      .update({ 
        status: 'approved',
        verified_at: new Date().toISOString()
      })
      .eq('id', verificationRequest.id);

    if (updateRequestError) {
      logStep("Error updating verification request", updateRequestError);
      throw new Error("Failed to update verification request");
    }

    logStep("Verification request updated to approved");

    // Update the user's profile with business information
    const { error: updateProfileError } = await supabaseClient
      .from('profiles')
      .update({ 
        name: verificationRequest.business_name,
        business_id: verificationRequest.primary_license,
        phone: verificationRequest.phone || null,
        address: verificationRequest.address || null,
        city: verificationRequest.city || null,
        state: verificationRequest.state || null,
        zipcode: verificationRequest.zipcode || null,
        verified: true
      })
      .eq('id', verificationRequest.user_id);

    if (updateProfileError) {
      logStep("Error updating user profile", updateProfileError);
      throw new Error("Failed to update user profile");
    }

    logStep("User profile updated successfully");

    // Update business_info table with comprehensive verification data
    const { error: updateBusinessError } = await supabaseClient
      .from('business_info')
      .upsert({
        id: verificationRequest.user_id,
        business_name: verificationRequest.business_name,
        license_number: verificationRequest.primary_license,
        license_type: verificationRequest.license_type,
        license_status: 'verified',
        verified: true,
        business_category: verificationRequest.business_type,
        business_subcategory: verificationRequest.business_subcategory,
        license_state: verificationRequest.license_state,
        website: verificationRequest.website,
        additional_licenses: verificationRequest.additional_licenses,
        additional_info: verificationRequest.additional_info
      });

    if (updateBusinessError) {
      logStep("Error updating business_info", updateBusinessError);
      // Don't fail the verification for this, just log it
    } else {
      logStep("Business info updated successfully");
    }

    // Get the user's email for sending congratulatory email
    const { data: userData, error: userError } = await supabaseClient.auth.admin.getUserById(verificationRequest.user_id);
    
    if (userError || !userData.user?.email) {
      logStep("Warning: Could not get user email for congratulatory message", userError);
    } else {
      logStep("Sending congratulatory email", { email: userData.user.email });
      
      // Send congratulatory email to the business owner
      try {
        const congratsEmailResponse = await resend.emails.send({
          from: "Welp Verification <support@mywelp.com>",
          to: [userData.user.email],
          subject: `🎉 ${verificationRequest.business_name} - Your Business is Now Verified!`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #28a745;">🎉 Congratulations! Your Business is Verified</h2>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Verification Complete</h3>
                <p><strong>Business Name:</strong> ${verificationRequest.business_name}</p>
                <p><strong>License Number:</strong> ${verificationRequest.primary_license}</p>
                <p><strong>License State:</strong> ${verificationRequest.license_state}</p>
                <p><strong>Business Category:</strong> ${verificationRequest.business_type}</p>
              </div>

              <div style="background: #e7f5e7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
                <h3>What's Next?</h3>
                <p>✅ Your business profile now displays the verified badge</p>
                <p>✅ Customers can see your verification status</p>
                <p>✅ Your business information is now complete</p>
                <p>✅ You have access to all verified business features</p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <p style="color: #6c757d; font-size: 14px;">
                  Thank you for completing the verification process! Your verified status helps build trust with customers.
                </p>
              </div>
            </div>
          `,
        });

        if (congratsEmailResponse.error) {
          logStep("Error sending congratulatory email", congratsEmailResponse.error);
        } else {
          logStep("Congratulatory email sent successfully", { emailId: congratsEmailResponse.data?.id });
        }
      } catch (emailError) {
        logStep("Error sending congratulatory email", emailError);
        // Don't fail the verification for email issues
      }
    }

    logStep("Verification completed successfully");

    // Return HTML response that shows verification success
    return new Response(`
      <html>
        <head>
          <title>Business Verification Complete</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            .success { background: #e7f5e7; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; }
            .check { color: #28a745; font-size: 24px; }
          </style>
        </head>
        <body>
          <div class="success">
            <h2 class="check">✅ Business Verification Complete!</h2>
            <p><strong>Business Name:</strong> ${verificationRequest.business_name}</p>
            <p><strong>License Number:</strong> ${verificationRequest.primary_license}</p>
            <p>The business owner has been notified via email and their account is now verified.</p>
          </div>
        </body>
      </html>
    `, {
      headers: { 
        ...corsHeaders, 
        "Content-Type": "text/html" 
      },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    return new Response(`
      <html>
        <head>
          <title>Verification Error</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            .error { background: #f8d7da; padding: 20px; border-radius: 8px; border-left: 4px solid #dc3545; }
          </style>
        </head>
        <body>
          <div class="error">
            <h2>❌ Verification Failed</h2>
            <p>Error: ${errorMessage}</p>
          </div>
        </body>
      </html>
    `, {
      headers: { 
        ...corsHeaders, 
        "Content-Type": "text/html" 
      },
      status: 400,
    });
  }
});
