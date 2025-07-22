
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

    // Create the user account
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: userData.password,
      email_confirm: true, // Mark email as confirmed
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

    // Create the user profile using the create-profile edge function
    const profileResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/create-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`
      },
      body: JSON.stringify({
        userId: userId,
        name: userData.name,
        phone: userData.phone,
        address: userData.address,
        city: userData.city,
        state: userData.state,
        zipCode: userData.zipCode,
        type: accountType,
        email: email,
        verified: true, // Customer accounts are verified after email verification
        firstName: userData.firstName,
        lastName: userData.lastName
      })
    });

    if (!profileResponse.ok) {
      const profileError = await profileResponse.text();
      console.error("Profile creation failed:", profileError);
      throw new Error("Failed to create user profile");
    }

    console.log("Profile created successfully");

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
