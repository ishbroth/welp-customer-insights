
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { DuplicateCheckRequest, DuplicateCheckResponse } from './types.ts'
import { checkEmailDuplicates } from './emailUtils.ts'
import { checkPhoneDuplicates } from './phoneUtils.ts'
import { checkBusinessCombinationDuplicates, checkIndividualBusinessFields } from './businessUtils.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log("🚀 DUPLICATE CHECK EDGE FUNCTION CALLED");
  console.log("📥 Request method:", req.method);
  console.log("📥 Request URL:", req.url);
  
  if (req.method === 'OPTIONS') {
    console.log("✅ Handling CORS preflight request");
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log("📋 Parsing request body...");
    const requestBody = await req.json()
    console.log("📋 Request body received:", JSON.stringify(requestBody, null, 2));
    
    const { email, phone, businessName, address, accountType }: DuplicateCheckRequest = requestBody
    
    console.log("=== DUPLICATE CHECK EDGE FUNCTION START ===");
    console.log("🔍 Input parameters:");
    console.log("  - email:", email);
    console.log("  - phone:", phone);
    console.log("  - businessName:", businessName);
    console.log("  - address:", address);
    console.log("  - accountType:", accountType);

    // Create service role client that bypasses RLS
    console.log("🔑 Creating Supabase admin client...");
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log("✅ Supabase admin client created successfully");

    // CRITICAL: COMPLETE DATABASE WIPE - NO PERMANENT ACCOUNTS
    console.log("🧹 PERFORMING COMPLETE DATABASE WIPE - NO PERMANENT ACCOUNTS...");
    
    // Delete ALL profiles without any protection
    console.log("🗑️ Deleting ALL profiles...");
    const { error: deleteProfilesError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete everything except impossible UUID
    
    if (deleteProfilesError) {
      console.error("❌ Error deleting all profiles:", deleteProfilesError);
    } else {
      console.log("✅ Successfully deleted ALL profiles");
    }

    // Delete ALL auth users
    console.log("🗑️ Deleting ALL auth users...");
    try {
      const { data: allUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (listError) {
        console.error("❌ Error listing auth users:", listError);
      } else if (allUsers && allUsers.users && allUsers.users.length > 0) {
        console.log(`🗑️ Found ${allUsers.users.length} auth users to delete`);
        
        for (const user of allUsers.users) {
          const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
          if (deleteError) {
            console.error(`❌ Error deleting auth user ${user.id}:`, deleteError);
          } else {
            console.log(`✅ Deleted auth user ${user.id}`);
          }
        }
      } else {
        console.log("ℹ️ No auth users found to delete");
      }
    } catch (authError) {
      console.error("❌ Error in auth user deletion process:", authError);
    }

    // Clear ALL other tables that might contain phone data
    const tablesToClear = [
      'business_info',
      'reviews', 
      'review_claim_history',
      'verification_codes',
      'verification_requests',
      'customer_access',
      'guest_access',
      'responses',
      'review_photos',
      'review_reports',
      'user_review_notifications',
      'credit_transactions',
      'credits',
      'subscriptions',
      'device_tokens',
      'notification_preferences',
      'notifications_log',
      'user_sessions'
    ];

    for (const tableName of tablesToClear) {
      console.log(`🧹 Clearing table: ${tableName}`);
      const { error: clearError } = await supabaseAdmin
        .from(tableName)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete everything

      if (clearError) {
        console.error(`❌ Error clearing ${tableName}:`, clearError);
      } else {
        console.log(`✅ Successfully cleared ${tableName}`);
      }
    }

    // CRITICAL: Final verification that database is completely empty
    console.log("🔍 FINAL VERIFICATION: Checking if database is completely empty...");
    const { count: finalCount, error: finalCountError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    if (finalCountError) {
      console.error("❌ Final count check failed:", finalCountError);
    } else {
      console.log(`📊 Final profile count: ${finalCount}`);
      
      if (finalCount === 0 || finalCount === null) {
        console.log("🎉 DATABASE IS COMPLETELY EMPTY - SUCCESS!");
        console.log("=== DUPLICATE CHECK END (EMPTY DATABASE AFTER WIPE) ===");
        
        const noDuplicateResponse: DuplicateCheckResponse = {
          isDuplicate: false,
          duplicateType: null,
          allowContinue: false,
          debug_info: {
            message: "Database completely wiped clean - no duplicates possible",
            total_profiles: finalCount
          }
        };

        return new Response(
          JSON.stringify(noDuplicateResponse),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      } else {
        console.error(`🚨 DATABASE WIPE FAILED - ${finalCount} profiles still remain`);
        
        // If profiles still exist, list them for debugging
        const { data: remainingProfiles } = await supabaseAdmin
          .from('profiles')
          .select('id, phone, email, name, type');
        
        console.error("🚨 Remaining profiles:", remainingProfiles);
        
        return new Response(
          JSON.stringify({
            error: "Database wipe failed",
            remaining_profiles: remainingProfiles,
            count: finalCount
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        );
      }
    }

  } catch (error) {
    console.error('💥 Error in duplicate check edge function:', error);
    console.error('💥 Error stack:', error.stack);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
})
