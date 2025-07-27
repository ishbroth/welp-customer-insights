
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

    // Check if the verification code is valid (but don't mark as used yet)
    const { data: verificationData, error: verificationError } = await supabaseAdmin
      .from('email_verification_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .maybeSingle();

    if (verificationError) {
      console.error("Database error checking verification code:", verificationError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          isValid: false, 
          message: "Database error during verification" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!verificationData) {
      console.log("Invalid, expired, or already used verification code");
      
      // Check if code exists but is expired or used
      const { data: existingCode } = await supabaseAdmin
        .from('email_verification_codes')
        .select('used, expires_at')
        .eq('email', email)
        .eq('code', code)
        .maybeSingle();

      let errorMessage = "Invalid or expired verification code";
      if (existingCode) {
        if (existingCode.used) {
          errorMessage = "This verification code has already been used. Please request a new one.";
        } else if (new Date(existingCode.expires_at) < new Date()) {
          errorMessage = "This verification code has expired. Please request a new one.";
        }
      }

      return new Response(
        JSON.stringify({ 
          success: false, 
          isValid: false, 
          message: errorMessage 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Email code verified successfully, processing account...");

    // Check if user already exists
    const { data: existingUser, error: userCheckError } = await supabaseAdmin.auth.admin.listUsers();
    
    let userId: string;
    let userCreated = false;
    let existingUserFound = false;

    if (!userCheckError && existingUser?.users) {
      const foundUser = existingUser.users.find(u => u.email === email);
      if (foundUser) {
        userId = foundUser.id;
        existingUserFound = true;
        console.log("Using existing user with ID:", userId);
      }
    }

    if (!existingUserFound) {
      // Create new user account with admin client - email confirmed from the start
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
        return new Response(
          JSON.stringify({ 
            success: false, 
            isValid: false, 
            message: `Failed to create user: ${authError.message}` 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      userId = authData.user.id;
      userCreated = true;
      console.log("User created successfully with ID:", userId);
    }

    // Create or update profile record using admin client
    const profileData = {
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
    };

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert(profileData, { onConflict: 'id' });

    if (profileError) {
      console.error("Error creating/updating profile:", profileError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          isValid: false, 
          message: `Failed to create/update profile: ${profileError.message}` 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Profile created/updated successfully");

    // For business accounts, create or update business_info record
    if (accountType === 'business') {
      const businessData = {
        id: userId,
        business_name: userData.businessName || userData.name,
        license_number: userData.licenseNumber,
        license_type: userData.licenseType,
        license_state: userData.state,
        license_status: userData.licenseVerificationResult?.verified ? 'verified' : 'pending',
        verified: userData.licenseVerificationResult?.verified && userData.licenseVerificationResult?.isRealVerification
      };

      const { error: businessError } = await supabaseAdmin
        .from('business_info')
        .upsert(businessData, { onConflict: 'id' });

      if (businessError) {
        console.error("Error creating/updating business info:", businessError);
        // Don't fail the entire process, just log the error
      } else {
        console.log("Business info created/updated successfully");
      }
    }

    // ONLY NOW mark the verification code as used (after successful account creation)
    const { error: markUsedError } = await supabaseAdmin
      .from('email_verification_codes')
      .update({ used: true })
      .eq('id', verificationData.id);

    if (markUsedError) {
      console.error("Error marking verification code as used:", markUsedError);
      // Don't fail the process, just log the error
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
