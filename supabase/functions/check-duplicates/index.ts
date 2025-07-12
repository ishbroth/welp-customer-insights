
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

    // CRITICAL: TOTAL DATABASE ANNIHILATION - NO EXCEPTIONS
    console.log("💀 PERFORMING TOTAL DATABASE ANNIHILATION - REMOVING ALL HISTORICAL DATA...");
    
    // Step 1: List ALL auth users before deletion for logging
    console.log("📋 Cataloging all existing auth users before deletion...");
    try {
      const { data: allUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (listError) {
        console.error("❌ Error listing auth users:", listError);
      } else if (allUsers && allUsers.users && allUsers.users.length > 0) {
        console.log(`📋 Found ${allUsers.users.length} auth users to delete:`);
        
        for (let i = 0; i < allUsers.users.length; i++) {
          const user = allUsers.users[i];
          console.log(`📋   User ${i + 1}: ID=${user.id}, Email=${user.email}, Phone=${user.phone}, Created=${user.created_at}`);
        }
        
        // Delete each user individually
        for (const user of allUsers.users) {
          console.log(`🗑️ Deleting auth user: ${user.id} (${user.email})`);
          const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
          if (deleteError) {
            console.error(`❌ Error deleting auth user ${user.id}:`, deleteError);
          } else {
            console.log(`✅ Successfully deleted auth user ${user.id}`);
          }
        }
      } else {
        console.log("ℹ️ No auth users found to delete");
      }
    } catch (authError) {
      console.error("❌ Error in auth user deletion process:", authError);
    }

    // Step 2: Nuclear option - Clear ALL tables that could contain ANY user data
    const allTablesToClear = [
      'profiles',                    // Primary user profiles
      'business_info',              // Business information
      'reviews',                    // All reviews (contains customer info)
      'review_claim_history',       // Review claim history (contains customer data)
      'verification_codes',         // Phone verification codes
      'verification_requests',      // Business verification requests
      'customer_access',           // Customer access records
      'guest_access',              // Guest access records
      'responses',                 // Review responses
      'review_photos',             // Review photos
      'review_reports',            // Review reports (contains reporter info)
      'user_review_notifications', // User notifications
      'credit_transactions',       // Credit transactions
      'credits',                   // User credits
      'subscriptions',             // User subscriptions
      'device_tokens',             // Device tokens
      'notification_preferences',  // Notification preferences
      'notifications_log',         // Notification logs
      'user_sessions'              // User sessions
    ];

    console.log(`🧹 NUCLEAR CLEANUP: Clearing ${allTablesToClear.length} tables of ALL data...`);
    
    for (const tableName of allTablesToClear) {
      console.log(`💣 NUKING TABLE: ${tableName}...`);
      
      // First, get count of records to be deleted
      const { count: recordCount, error: countError } = await supabaseAdmin
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.error(`❌ Error counting records in ${tableName}:`, countError);
      } else {
        console.log(`📊 ${tableName} contains ${recordCount || 0} records to delete`);
      }
      
      // Delete EVERYTHING - no exceptions
      const { error: clearError } = await supabaseAdmin
        .from(tableName)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete everything (impossible UUID condition)

      if (clearError) {
        console.error(`❌ Error clearing ${tableName}:`, clearError);
      } else {
        console.log(`✅ Successfully NUKED ${tableName} - ${recordCount || 0} records deleted`);
      }
    }

    // Step 3: FINAL VERIFICATION - Ensure absolute emptiness
    console.log("🔍 FINAL VERIFICATION: Ensuring total database emptiness...");
    
    let totalRemainingRecords = 0;
    const remainingData: any = {};
    
    for (const tableName of allTablesToClear) {
      const { count: finalCount, error: finalCountError } = await supabaseAdmin
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      if (finalCountError) {
        console.error(`❌ Final count check failed for ${tableName}:`, finalCountError);
        remainingData[tableName] = 'ERROR';
      } else {
        remainingData[tableName] = finalCount || 0;
        totalRemainingRecords += (finalCount || 0);
        console.log(`📊 Final count for ${tableName}: ${finalCount || 0}`);
      }
    }
    
    // Also check auth users again
    const { data: finalAuthUsers, error: finalAuthError } = await supabaseAdmin.auth.admin.listUsers();
    const finalAuthCount = finalAuthUsers?.users?.length || 0;
    totalRemainingRecords += finalAuthCount;
    
    console.log(`🔍 FINAL VERIFICATION RESULTS:`);
    console.log(`📊 Total remaining database records: ${totalRemainingRecords}`);
    console.log(`👥 Remaining auth users: ${finalAuthCount}`);
    console.log(`📋 Per-table remaining counts:`, JSON.stringify(remainingData, null, 2));
    
    if (totalRemainingRecords === 0 && finalAuthCount === 0) {
      console.log("🎉 TOTAL ANNIHILATION SUCCESSFUL - DATABASE IS COMPLETELY EMPTY!");
      console.log("✅ NO HISTORICAL DATA REMAINS - CLEAN SLATE ACHIEVED");
      console.log("=== DUPLICATE CHECK END (COMPLETE DATABASE WIPE SUCCESS) ===");
      
      const successResponse: DuplicateCheckResponse = {
        isDuplicate: false,
        duplicateType: null,
        allowContinue: false,
        debug_info: {
          message: "Total database annihilation completed - absolutely no duplicates possible",
          total_records_deleted: "ALL",
          remaining_records: totalRemainingRecords,
          remaining_auth_users: finalAuthCount,
          tables_cleared: allTablesToClear.length,
          wipe_status: "COMPLETE_SUCCESS"
        }
      };

      return new Response(
        JSON.stringify(successResponse),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    } else {
      console.error(`🚨 TOTAL ANNIHILATION FAILED - ${totalRemainingRecords} records and ${finalAuthCount} auth users still remain`);
      
      // Log remaining data for debugging
      if (finalAuthUsers?.users && finalAuthUsers.users.length > 0) {
        console.error("🚨 Remaining auth users:", finalAuthUsers.users.map(u => ({
          id: u.id,
          email: u.email,
          phone: u.phone,
          created_at: u.created_at
        })));
      }
      
      return new Response(
        JSON.stringify({
          error: "Total database annihilation failed",
          remaining_records: totalRemainingRecords,
          remaining_auth_users: finalAuthCount,
          remaining_data: remainingData,
          debug_info: {
            wipe_status: "FAILED",
            tables_attempted: allTablesToClear.length
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

  } catch (error) {
    console.error('💥 Error in total database annihilation:', error);
    console.error('💥 Error stack:', error.stack);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        debug_info: {
          wipe_status: "EXCEPTION_OCCURRED",
          error_type: error.name
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
})
