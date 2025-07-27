
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, code, accountType, userData } = await req.json();
    
    if (!email || !code || !accountType || !userData) {
      throw new Error("Missing required fields");
    }

    console.log("Verifying email code for:", email);

    // Initialize Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check if the verification code is valid
    const { data: verificationData, error: verificationError } = await supabaseAdmin
      .from('email_verification_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .maybeSingle();

    if (verificationError || !verificationData) {
      console.log("Invalid or expired verification code");
      return new Response(
        JSON.stringify({ 
          success: false, 
          isValid: false, 
          message: "Invalid or expired verification code" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark the code as used
    await supabaseAdmin
      .from('email_verification_codes')
      .update({ used: true })
      .eq('id', verificationData.id);

    console.log("Email code verified successfully, creating account...");

    // Create the user account with admin client - email confirmed from the start
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: userData.password,
      email_confirm: true, // Mark email as confirmed since we verified the code
      user_metadata: {
        name: userData.name,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        accountType: accountType
      }
    });

    if (authError) {
      console.error("Error creating user:", authError);
      throw new Error(`Failed to create user: ${authError.message}`);
    }

    const userId = authData.user.id;
    console.log("User created successfully with ID:", userId);

    // Create profile record directly using admin client
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        name: userData.name,
        email: email,
        type: accountType,
        phone: userData.phone,
        address: userData.address,
        city: userData.city,
        state: userData.state,
        zipcode: userData.zipCode,
        first_name: userData.firstName,
        last_name: userData.lastName,
        verified: accountType === 'customer' // Customer accounts are verified after email verification
      });

    if (profileError) {
      console.error("Error creating profile:", profileError);
      throw new Error(`Failed to create profile: ${profileError.message}`);
    }

    console.log("Profile created successfully");

    // For business accounts, create business_info record
    if (accountType === 'business') {
      const { error: businessError } = await supabaseAdmin
        .from('business_info')
        .insert({
          id: userId,
          business_name: userData.businessName || userData.name,
          license_number: userData.licenseNumber,
          license_type: userData.licenseType,
          license_state: userData.state,
          license_status: userData.licenseVerificationResult?.verified ? 'verified' : 'pending',
          verified: userData.licenseVerificationResult?.verified && userData.licenseVerificationResult?.isRealVerification
        });

      if (businessError) {
        console.error("Error creating business info:", businessError);
        // Don't throw here, profile creation succeeded
      } else {
        console.log("Business info created successfully");
      }
    }

    // Initialize regular Supabase client for sign-in
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Sign in the user automatically
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: email,
      password: userData.password
    });

    if (signInError) {
      console.error("Auto sign-in failed:", signInError);
      // Account was created successfully, but auto sign-in failed
      return new Response(
        JSON.stringify({ 
          success: true, 
          isValid: true, 
          message: "Account created successfully. Please sign in manually.",
          accountCreated: true,
          autoSignInFailed: true
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("User signed in automatically");

    return new Response(
      JSON.stringify({ 
        success: true, 
        isValid: true, 
        message: "Email verified and account created successfully",
        userData: {
          ...userData,
          email_verified: true
        },
        session: signInData.session,
        user: signInData.user
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in verify-email-code function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        isValid: false, 
        message: error instanceof Error ? error.message : "Verification failed" 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
