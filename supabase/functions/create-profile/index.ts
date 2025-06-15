
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
    const { userId, name, phone, address, city, state, zipCode, type, bio, businessId, avatar, email, verified } = await req.json();
    
    console.log("create-profile function called with:", { userId, name, phone, address, city, state, zipCode, type, bio, businessId, avatar, email, verified });
    
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
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    let profileOperation;
    
    // Split name into first_name and last_name for database storage
    const nameParts = (name || '').trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    // Prepare profile data - ensure all fields are properly mapped and preserved
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
      // CRITICAL: Set verified status - customer accounts are auto-verified after phone verification
      verified: type === 'customer' ? (verified !== undefined ? verified : true) : false,
      updated_at: new Date().toISOString(),
    };

    console.log("Profile update data being saved:", profileUpdateData);
    console.log(`VERIFICATION STATUS: Account type: ${type}, Verified status: ${profileUpdateData.verified}`);

    if (existingProfile) {
      // Profile exists, update it - preserve non-empty existing data where new data is empty
      console.log("Updating existing profile with data:", profileUpdateData);
      
      // Merge with existing data, but prioritize new data when it's provided
      const mergedData = {
        name: profileUpdateData.name || existingProfile.name || '',
        first_name: profileUpdateData.first_name || existingProfile.first_name || '',
        last_name: profileUpdateData.last_name || existingProfile.last_name || '',
        phone: profileUpdateData.phone || existingProfile.phone || '',
        address: profileUpdateData.address || existingProfile.address || '',
        city: profileUpdateData.city || existingProfile.city || '',
        state: profileUpdateData.state || existingProfile.state || '',
        zipcode: profileUpdateData.zipcode || existingProfile.zipcode || '',
        bio: profileUpdateData.bio || existingProfile.bio || '',
        avatar: profileUpdateData.avatar || existingProfile.avatar || '',
        business_id: profileUpdateData.business_id || existingProfile.business_id || '',
        email: profileUpdateData.email || existingProfile.email || '',
        type: profileUpdateData.type, // Always use the provided type
        verified: profileUpdateData.verified, // Always use the provided verification status
        updated_at: profileUpdateData.updated_at,
      };
      
      console.log("Merged profile data:", mergedData);
      
      profileOperation = supabase
        .from('profiles')
        .update(mergedData)
        .eq('id', userId)
        .select();
    } else {
      // Profile doesn't exist, insert it
      console.log("Creating new profile with data:", { id: userId, ...profileUpdateData, created_at: new Date().toISOString() });
      profileOperation = supabase
        .from('profiles')
        .insert({
          id: userId,
          ...profileUpdateData,
          created_at: new Date().toISOString(),
        })
        .select();
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
            verified: false, // Business accounts start unverified
          });
      }

      const { error: businessError } = await businessOperation;

      if (businessError) {
        console.error("Business info creation/update error:", businessError);
        throw new Error(`Failed to create/update business info: ${businessError.message}`);
      }

      console.log("Business info operation successful");
    }

    // Final verification - fetch the updated data to confirm it was saved
    const { data: finalVerificationData, error: finalVerificationError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (finalVerificationError) {
      console.error("Error in final verification:", finalVerificationError);
      throw new Error("Profile update verification failed");
    }

    console.log("Final verification - data confirmed in database:", finalVerificationData);
    console.log(`FINAL VERIFICATION STATUS: User ${userId}, Type: ${finalVerificationData.type}, Verified: ${finalVerificationData.verified}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Profile created/updated successfully",
        data: finalVerificationData
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
