
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
    console.log("🔍 Verify-email-code function called");
    
    const requestData = await req.json();
    console.log("📋 Request data:", { 
      email: requestData.email, 
      code: requestData.code ? "***" : undefined,
      accountType: requestData.accountType 
    });
    
    const { email, code, accountType, userData } = requestData;

    // Validate required fields
    if (!email || !code) {
      console.error("❌ Email and code are required");
      throw new Error("Email and verification code are required");
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

    // Check if the code is valid and not expired
    try {
      const { data: verificationData, error: dbError } = await supabase
        .from("verification_codes")
        .select("*")
        .eq("email", email)
        .eq("code", code)
        .eq("verification_type", "email")
        .gt("expires_at", new Date().toISOString())
        .single();
      
      if (dbError || !verificationData) {
        console.log("❌ Invalid or expired verification code:", { 
          hasData: !!verificationData, 
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

      // Create user account if userData is provided
      if (userData) {
        console.log("👤 Creating user account...");
        
        try {
          // Create auth user
          const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: email,
            password: userData.password,
            email_confirm: true,
            user_metadata: {
              type: accountType || 'customer',
              first_name: userData.firstName || '',
              last_name: userData.lastName || '',
              business_name: userData.businessName || '',
              name: userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim()
            }
          });

          if (authError) {
            console.error("❌ Auth error:", authError);
            throw new Error(`Failed to create user account: ${authError.message}`);
          }

          console.log("✅ User created successfully:", authData.user?.id);

          // Update profile with additional data
          const profileData: any = {
            email: email,
            phone: userData.phone || '',
            address: userData.address || '',
            city: userData.city || '',
            state: userData.state || '',
            zipcode: userData.zipCode || '',
            type: accountType || 'customer'
          };

          if (accountType === 'customer') {
            profileData.name = userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
          }

          const { error: profileError } = await supabase
            .from('profiles')
            .update(profileData)
            .eq('id', authData.user!.id);

          if (profileError) {
            console.error("⚠️ Profile update error:", profileError);
            // Don't fail the verification, just log the error
          }

          // For business accounts, update business_info
          if (accountType === 'business' && userData.businessName) {
            const businessData: any = {
              business_name: userData.businessName,
              license_number: userData.licenseNumber || '',
              license_type: userData.licenseType || '',
              license_state: userData.state || ''
            };

            const { error: businessError } = await supabase
              .from('business_info')
              .update(businessData)
              .eq('id', authData.user!.id);

            if (businessError) {
              console.error("⚠️ Business info update error:", businessError);
              // Don't fail the verification, just log the error
            }
          }

          console.log("✅ User profile updated successfully");

        } catch (userError) {
          console.error("❌ User creation error:", userError);
          throw new Error(`Failed to create user account: ${userError.message}`);
        }
      }

      // Remove the used code
      const { error: deleteError } = await supabase
        .from("verification_codes")
        .delete()
        .eq("email", email)
        .eq("verification_type", "email");
      
      if (deleteError) {
        console.error("⚠️ Error deleting used code:", deleteError);
        // Don't fail the verification, just log the error
      }
      
      console.log("✅ Email verification successful");
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          isValid: true, 
          message: "Email verified successfully"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
      
    } catch (dbError) {
      console.error("❌ Database error during verification:", dbError);
      throw new Error("Database error during verification");
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("💥 Error in verify-email-code function:", errorMessage);
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
