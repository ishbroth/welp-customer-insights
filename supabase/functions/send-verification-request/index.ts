
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-VERIFICATION-REQUEST] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Check if Resend API key is available
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      logStep("ERROR: RESEND_API_KEY not found in environment variables");
      throw new Error("RESEND_API_KEY not configured. Please add your Resend API key to the edge function secrets.");
    }
    logStep("Resend API key found");

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { userInfo, formData } = await req.json();
    logStep("Request data received", { userInfo, formData });

    // Generate verification token
    const verificationToken = crypto.randomUUID();
    
    // Store verification request in database
    const { error: insertError } = await supabaseClient
      .from('verification_requests')
      .insert({
        user_id: user.id,
        verification_token: verificationToken,
        business_name: formData.businessName,
        primary_license: formData.primaryLicense,
        license_state: formData.licenseState,
        license_type: formData.licenseType,
        business_type: formData.businessType,
        business_subcategory: formData.businessSubcategory,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipcode: formData.zipCode,
        phone: formData.phone,
        website: formData.website,
        additional_licenses: formData.additionalLicenses,
        additional_info: formData.additionalInfo,
        status: 'pending'
      });

    if (insertError) {
      logStep("Error storing verification request", insertError);
      throw new Error("Failed to store verification request");
    }

    logStep("Verification request stored", { token: verificationToken });

    // Create verification URL for the edge function
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const verificationUrl = `${supabaseUrl}/functions/v1/verify-business?token=${verificationToken}`;

    // Send email to support@mywelp.com using your verified domain
    const emailResponse = await resend.emails.send({
      from: "Welp Verification <support@mywelp.com>",
      to: ["support@mywelp.com"],
      subject: `Business Verification Request - ${formData.businessName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ea384c;">New Business Verification Request</h2>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Business Information</h3>
            <p><strong>Business Name:</strong> ${formData.businessName}</p>
            <p><strong>Primary License:</strong> ${formData.primaryLicense}</p>
            <p><strong>License Type:</strong> ${formData.licenseType || 'Not specified'}</p>
            <p><strong>License State:</strong> ${formData.licenseState}</p>
            <p><strong>Business Category:</strong> ${formData.businessType}</p>
            <p><strong>Business Subcategory:</strong> ${formData.businessSubcategory || 'Not specified'}</p>
          </div>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Contact Information</h3>
            <p><strong>User Email:</strong> ${userInfo.email}</p>
            <p><strong>Phone:</strong> ${formData.phone || 'Not provided'}</p>
            <p><strong>Address:</strong> ${formData.address || 'Not provided'}</p>
            <p><strong>City, State ZIP:</strong> ${formData.city || ''} ${formData.state || ''} ${formData.zipCode || ''}</p>
            <p><strong>Website:</strong> ${formData.website || 'Not provided'}</p>
          </div>

          ${formData.additionalLicenses ? `
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Additional Licenses</h3>
              <p>${formData.additionalLicenses}</p>
            </div>
          ` : ''}

          ${formData.additionalInfo ? `
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Additional Information</h3>
              <p>${formData.additionalInfo}</p>
            </div>
          ` : ''}

          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block;">
              Verify Business
            </a>
          </div>

          <p style="color: #6c757d; font-size: 14px;">
            Click the "Verify Business" button above to approve this verification request.
            This will grant the business a verified status on their profile and reviews.
          </p>
        </div>
      `,
    });

    if (emailResponse.error) {
      logStep("Error sending email", emailResponse.error);
      throw new Error(`Failed to send verification email: ${emailResponse.error.message}`);
    }

    logStep("Verification email sent successfully", { emailId: emailResponse.data?.id });

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Verification request submitted successfully" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
