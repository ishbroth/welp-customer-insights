
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
    const { userId, name, phone, address, city, state, zipCode, type, bio, businessId, avatar, email } = await req.json();
    
    console.log("create-profile function called with:", { userId, name, phone, address, city, state, zipCode, type, bio, businessId, avatar, email });
    
    // Simple validation
    if (!userId || !type) {
      throw new Error("User ID and account type are required");
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
    
    let profileOperation;
    
    // Split name into first_name and last_name for database storage
    const nameParts = (name || '').trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    // Prepare profile data - ensure all fields are properly mapped
    const profileUpdateData = {
      name: name || '',
      first_name: firstName,
      last_name: lastName,
      phone: phone || '',
      address: address || '',
      city: city || '',
      state: state || '',
      zipcode: zipCode || '', // Note: database column is 'zipcode', not 'zipCode'
      type: type,
      bio: bio || '',
      avatar: avatar || '',
      business_id: businessId || '',
      email: email || '',
      updated_at: new Date().toISOString(),
    };

    console.log("Profile update data being saved:", profileUpdateData);

    if (existingProfile) {
      // Profile exists, update it
      console.log("Updating existing profile with data:", profileUpdateData);
      profileOperation = supabase
        .from('profiles')
        .update(profileUpdateData)
        .eq('id', userId);
    } else {
      // Profile doesn't exist, insert it
      console.log("Creating new profile with data:", { id: userId, ...profileUpdateData, created_at: new Date().toISOString() });
      profileOperation = supabase
        .from('profiles')
        .insert({
          id: userId,
          ...profileUpdateData,
          created_at: new Date().toISOString(),
        });
    }

    const { data: profileResult, error: profileError } = await profileOperation;

    if (profileError) {
      console.error("Profile creation/update error:", profileError);
      throw new Error(`Failed to create/update profile: ${profileError.message}`);
    }

    console.log("Profile operation successful, result:", profileResult);

    // If it's a business account, check if business info exists and create/update
    if (type === "business" && name) {
      console.log("Processing business info for business name:", name);
      
      const { data: existingBusiness } = await supabase
        .from('business_info')
        .select('id')
        .eq('id', userId)
        .maybeSingle();
      
      let businessOperation;
      
      if (existingBusiness) {
        // Business info exists, update it
        console.log("Updating existing business info");
        businessOperation = supabase
          .from('business_info')
          .update({
            business_name: name,
          })
          .eq('id', userId);
      } else {
        // Business info doesn't exist, insert it
        console.log("Creating new business info");
        businessOperation = supabase
          .from('business_info')
          .insert({
            id: userId,
            business_name: name,
            verified: false,
          });
      }

      const { error: businessError } = await businessOperation;

      if (businessError) {
        console.error("Business info creation/update error:", businessError);
        throw new Error(`Failed to create/update business info: ${businessError.message}`);
      }

      console.log("Business info operation successful");
    }

    // Verify the data was saved by fetching it back
    const { data: verificationData, error: verificationError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (verificationError) {
      console.error("Error verifying saved data:", verificationError);
    } else {
      console.log("Verification - data saved successfully:", verificationData);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Profile created/updated successfully",
        data: verificationData
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in create-profile function:", errorMessage);
    
    return new Response(
      JSON.stringify({ success: false, message: errorMessage }),
      { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
