
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

    // Parse request body for force delete options
    const body = await req.json().catch(() => ({}));
    const isForceDelete = body.forceDelete || false;
    const forceDeleteEmail = body.email || null;
    const adminOverride = body.adminOverride || false;

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

    let userId: string;

    if (isForceDelete && forceDeleteEmail && adminOverride) {
      console.log(`🔧 FORCE DELETE MODE: Attempting to delete corrupted account ${forceDeleteEmail}`);
      
      // For force delete, we need to find the user by email using admin client
      const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (listError) {
        console.error("❌ Error listing users:", listError);
        throw new Error("Failed to list users for force delete");
      }
      
      const targetUser = users.users.find(user => user.email === forceDeleteEmail);
      
      if (!targetUser) {
        console.log("ℹ️ User not found in auth.users - may already be deleted");
        
        // Still try to clean up any remaining profile data
        const { data: profiles, error: profileError } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('email', forceDeleteEmail);
        
        if (profileError) {
          console.error("❌ Error checking profiles:", profileError);
        }
        
        if (profiles && profiles.length > 0) {
          userId = profiles[0].id;
          console.log(`🔄 Found orphaned profile data for ${forceDeleteEmail}, cleaning up...`);
        } else {
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: "Account not found - may already be deleted",
              recordsDeleted: 0 
            }),
            { 
              status: 200, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
      } else {
        userId = targetUser.id;
        console.log(`🎯 Found user for force delete: ${userId}`);
      }
      
    } else {
      // Normal deletion process - get user from auth header
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

      userId = user.id;
    }

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
      'user_sessions',
      'email_verification_codes'
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

        // For email_verification_codes, clean by email if we have it
        if (table === 'email_verification_codes' && forceDeleteEmail) {
          const { data, error } = await supabaseAdmin
            .from('email_verification_codes')
            .delete()
            .eq('email', forceDeleteEmail);
          
          if (!error && data) {
            const deletedCount = Array.isArray(data) ? data.length : (data ? 1 : 0);
            if (deletedCount > 0) {
              console.log(`✅ Deleted ${deletedCount} email verification codes`);
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
      
      // Also try deleting by email if we have it (for corrupted accounts)
      if (forceDeleteEmail) {
        const { data: emailProfileData, error: emailProfileError } = await supabaseAdmin
          .from('profiles')
          .delete()
          .eq('email', forceDeleteEmail);
        
        if (!emailProfileError && emailProfileData) {
          const deletedCount = Array.isArray(emailProfileData) ? emailProfileData.length : (emailProfileData ? 1 : 0);
          if (deletedCount > 0) {
            console.log(`✅ Deleted profile by email: ${deletedCount} records`);
            totalRecordsDeleted += deletedCount;
          }
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
        // Don't throw here for force delete - we might be cleaning up orphaned data
        if (!isForceDelete) {
          throw deleteUserError;
        }
      } else {
        console.log(`✅ Successfully deleted auth user account`);
      }
    } catch (error) {
      console.log(`⚠️ Error in auth user deletion: ${error.message}`);
      if (!isForceDelete) {
        throw error;
      }
    }

    const message = isForceDelete 
      ? `Force deletion completed for ${forceDeleteEmail}` 
      : "Account successfully deleted";

    console.log(`🎉 ACCOUNT DELETION COMPLETE: Removed ${totalRecordsDeleted} database records for user ${userId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: message,
        recordsDeleted: totalRecordsDeleted,
        forceDelete: isForceDelete
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
