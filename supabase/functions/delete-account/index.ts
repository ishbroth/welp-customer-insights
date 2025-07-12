
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🗑️ ACCOUNT DELETION: Starting comprehensive account deletion process");

    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log("❌ No authorization header provided");
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: corsHeaders }
      );
    }

    // Create regular client to verify user
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: authHeader } }
      }
    );

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.log("❌ Invalid user token");
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: corsHeaders }
      );
    }

    const userId = user.id;
    console.log(`🎯 ACCOUNT DELETION: Processing deletion for user ID: ${userId}`);

    // Define all tables that might contain user data
    const dataCleanupTables = [
      'user_review_notifications',
      'review_photos',
      'responses',
      'review_reports',
      'review_claim_history',
      'reviews',
      'guest_access',
      'customer_access',
      'verification_codes',
      'verification_requests',
      'credit_transactions',
      'credits',
      'subscriptions',
      'notification_preferences',
      'notifications_log',
      'device_tokens',
      'user_sessions'
    ];

    let totalRecordsDeleted = 0;

    // Step 1: Delete user-specific data from all tables
    console.log("🧹 STEP 1: Cleaning user-specific data from all tables");
    
    for (const table of dataCleanupTables) {
      try {
        // Try different user ID column patterns
        const userIdColumns = ['user_id', 'customer_id', 'business_id', 'author_id', 'reporter_id'];
        
        for (const column of userIdColumns) {
          const { data, error } = await supabaseAdmin
            .from(table)
            .delete()
            .eq(column, userId);
          
          if (!error && data) {
            const deletedCount = Array.isArray(data) ? data.length : (data ? 1 : 0);
            if (deletedCount > 0) {
              console.log(`✅ Deleted ${deletedCount} records from ${table}.${column}`);
              totalRecordsDeleted += deletedCount;
            }
          }
        }

        // For reviews table, also clean by claimed_by
        if (table === 'reviews') {
          const { data, error } = await supabaseAdmin
            .from('reviews')
            .delete()
            .eq('claimed_by', userId);
          
          if (!error && data) {
            const deletedCount = Array.isArray(data) ? data.length : (data ? 1 : 0);
            if (deletedCount > 0) {
              console.log(`✅ Deleted ${deletedCount} claimed reviews`);
              totalRecordsDeleted += deletedCount;
            }
          }
        }
      } catch (error) {
        console.log(`⚠️ Error cleaning ${table}: ${error.message}`);
      }
    }

    // Step 2: Delete business info if exists
    console.log("🏢 STEP 2: Removing business information");
    try {
      const { data: businessData, error: businessError } = await supabaseAdmin
        .from('business_info')
        .delete()
        .eq('id', userId);
      
      if (!businessError && businessData) {
        const deletedCount = Array.isArray(businessData) ? businessData.length : (businessData ? 1 : 0);
        if (deletedCount > 0) {
          console.log(`✅ Deleted business info for user`);
          totalRecordsDeleted += deletedCount;
        }
      }
    } catch (error) {
      console.log(`⚠️ Error deleting business info: ${error.message}`);
    }

    // Step 3: Delete user profile
    console.log("👤 STEP 3: Removing user profile");
    try {
      const { data: profileData, error: profileError } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (!profileError && profileData) {
        const deletedCount = Array.isArray(profileData) ? profileData.length : (profileData ? 1 : 0);
        if (deletedCount > 0) {
          console.log(`✅ Deleted user profile`);
          totalRecordsDeleted += deletedCount;
        }
      }
    } catch (error) {
      console.log(`⚠️ Error deleting profile: ${error.message}`);
    }

    // Step 4: Delete the auth user (this should cascade remaining references)
    console.log("🔐 STEP 4: Removing authentication account");
    try {
      const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userId);
      
      if (deleteUserError) {
        console.log(`❌ Error deleting auth user: ${deleteUserError.message}`);
        throw deleteUserError;
      } else {
        console.log(`✅ Successfully deleted auth user account`);
      }
    } catch (error) {
      console.log(`⚠️ Error in auth user deletion: ${error.message}`);
      throw error;
    }

    console.log(`🎉 ACCOUNT DELETION COMPLETE: Removed ${totalRecordsDeleted} database records and auth account for user ${userId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Account successfully deleted",
        recordsDeleted: totalRecordsDeleted 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ ACCOUNT DELETION ERROR:', error);
    return new Response(
      JSON.stringify({ 
        error: "Account deletion failed", 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
