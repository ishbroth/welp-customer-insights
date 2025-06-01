
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

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
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    
    if (!token) {
      throw new Error("Verification token is required");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Find the verification request
    const { data: verificationRequest, error: findError } = await supabaseClient
      .from('verification_requests')
      .select('*')
      .eq('verification_token', token)
      .eq('status', 'pending')
      .single();

    if (findError || !verificationRequest) {
      throw new Error("Invalid or expired verification token");
    }

    // Update the verification request status
    const { error: updateRequestError } = await supabaseClient
      .from('verification_requests')
      .update({ 
        status: 'approved',
        verified_at: new Date().toISOString()
      })
      .eq('id', verificationRequest.id);

    if (updateRequestError) {
      throw new Error("Failed to update verification request");
    }

    // Update the user's profile to mark as verified
    const { error: updateProfileError } = await supabaseClient
      .from('profiles')
      .update({ verified: true })
      .eq('id', verificationRequest.user_id);

    if (updateProfileError) {
      throw new Error("Failed to update user profile");
    }

    // Update business_info table if it exists
    const { error: updateBusinessError } = await supabaseClient
      .from('business_info')
      .upsert({
        id: verificationRequest.user_id,
        business_name: verificationRequest.business_name,
        license_number: verificationRequest.primary_license,
        license_type: verificationRequest.license_type,
        license_status: 'verified',
        verified: true
      });

    if (updateBusinessError) {
      console.log("Note: Could not update business_info table:", updateBusinessError);
    }

    // Return success page HTML
    const successPage = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Business Verified Successfully</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              max-width: 600px; 
              margin: 100px auto; 
              padding: 20px;
              background: #f8f9fa;
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 10px;
              text-align: center;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .success-icon {
              color: #28a745;
              font-size: 48px;
              margin-bottom: 20px;
            }
            h1 { color: #28a745; margin-bottom: 20px; }
            p { color: #6c757d; line-height: 1.6; }
            .business-name { 
              color: #ea384c; 
              font-weight: bold; 
              font-size: 18px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success-icon">✓</div>
            <h1>Business Verified Successfully!</h1>
            <div class="business-name">${verificationRequest.business_name}</div>
            <p>The business has been successfully verified and will now display the verified badge on their profile and reviews.</p>
            <p>The business owner will be notified of their verification status.</p>
          </div>
        </body>
      </html>
    `;

    return new Response(successPage, {
      headers: { 
        ...corsHeaders, 
        "Content-Type": "text/html" 
      },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    const errorPage = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Verification Error</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              max-width: 600px; 
              margin: 100px auto; 
              padding: 20px;
              background: #f8f9fa;
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 10px;
              text-align: center;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .error-icon {
              color: #dc3545;
              font-size: 48px;
              margin-bottom: 20px;
            }
            h1 { color: #dc3545; margin-bottom: 20px; }
            p { color: #6c757d; line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="error-icon">✗</div>
            <h1>Verification Error</h1>
            <p>${errorMessage}</p>
          </div>
        </body>
      </html>
    `;

    return new Response(errorPage, {
      headers: { 
        ...corsHeaders, 
        "Content-Type": "text/html" 
      },
      status: 400,
    });
  }
});
