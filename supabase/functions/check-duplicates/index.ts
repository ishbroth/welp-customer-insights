
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

    // CRITICAL: Test database connection and check if database is empty
    console.log("🧪 Testing database connection and checking if empty...");
    const { count: totalCount, error: testError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    if (testError) {
      console.error("❌ Database connection test failed:", testError);
      return new Response(
        JSON.stringify({ error: 'Database connection failed', details: testError }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    console.log("✅ Database connection successful, total profiles:", totalCount);
    
    // CRITICAL: If database is empty, return no duplicates immediately
    if (totalCount === 0 || totalCount === null) {
      console.log("🎉 DATABASE IS COMPLETELY EMPTY - NO DUPLICATES POSSIBLE");
      console.log("=== DUPLICATE CHECK END (EMPTY DATABASE) ===");
      
      const noDuplicateResponse: DuplicateCheckResponse = {
        isDuplicate: false,
        duplicateType: null,
        allowContinue: false
      };

      console.log("📤 Returning no duplicate response for empty database:", JSON.stringify(noDuplicateResponse, null, 2));
      return new Response(
        JSON.stringify(noDuplicateResponse),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    console.log("📊 Database has " + totalCount + " profiles, proceeding with duplicate checks...");

    // CRITICAL FIX: Clean up orphaned profiles before checking duplicates
    console.log("🧹 Checking for and cleaning up orphaned profiles...");
    
    // Get all profiles
    const { data: allProfiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, phone, name, type, address');

    if (profilesError) {
      console.error("❌ Error fetching profiles:", profilesError);
    } else if (allProfiles && allProfiles.length > 0) {
      console.log(`🔍 Found ${allProfiles.length} profiles, checking for orphaned records...`);
      
      // Check which profiles have corresponding auth users
      const orphanedProfiles = [];
      
      for (const profile of allProfiles) {
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(profile.id);
        
        if (authError && authError.message.includes('User not found')) {
          console.log(`🗑️ Found orphaned profile: ${profile.id} (${profile.name || profile.email})`);
          orphanedProfiles.push(profile.id);
        }
      }
      
      // Delete orphaned profiles
      if (orphanedProfiles.length > 0) {
        console.log(`🧹 Cleaning up ${orphanedProfiles.length} orphaned profiles...`);
        
        const { error: deleteError } = await supabaseAdmin
          .from('profiles')
          .delete()
          .in('id', orphanedProfiles);
        
        if (deleteError) {
          console.error("❌ Error deleting orphaned profiles:", deleteError);
        } else {
          console.log(`✅ Successfully cleaned up ${orphanedProfiles.length} orphaned profiles`);
        }
      } else {
        console.log("✅ No orphaned profiles found");
      }
    }

    // Now proceed with duplicate checks on clean data
    console.log("🔍 Proceeding with duplicate checks on cleaned data...");

    // Check email duplicates first (highest priority)
    if (email && accountType) {
      console.log("📧 Checking email duplicates...");
      const emailResult = await checkEmailDuplicates(supabaseAdmin, email, accountType);
      if (emailResult) {
        console.log("🚨 EMAIL DUPLICATE FOUND, returning result");
        console.log("📧 Email result:", JSON.stringify(emailResult, null, 2));
        console.log("=== DUPLICATE CHECK END (EMAIL FOUND) ===");
        return new Response(
          JSON.stringify(emailResult),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      }
      console.log("✅ No email duplicates found, continuing...");
    }

    // Check phone duplicates (second priority)
    if (phone && accountType) {
      console.log("📱 Checking phone duplicates...");
      const phoneResult = await checkPhoneDuplicates(supabaseAdmin, phone, accountType);
      if (phoneResult) {
        console.log("🚨 PHONE DUPLICATE FOUND, returning result");
        console.log("📱 Phone result:", JSON.stringify(phoneResult, null, 2));
        console.log("=== DUPLICATE CHECK END (PHONE FOUND) ===");
        return new Response(
          JSON.stringify(phoneResult),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      }
      console.log("✅ No phone duplicates found, continuing...");
    }

    // For business accounts, check business combination duplicates
    if (accountType === 'business' && businessName && address) {
      console.log("🏢 Checking business combination duplicates...");
      const businessCombinationResult = await checkBusinessCombinationDuplicates(supabaseAdmin, businessName, address);
      if (businessCombinationResult) {
        console.log("🚨 BUSINESS COMBINATION DUPLICATE FOUND, returning result");
        console.log("🏢 Business combination result:", JSON.stringify(businessCombinationResult, null, 2));
        console.log("=== DUPLICATE CHECK END (BUSINESS COMBINATION FOUND) ===");
        return new Response(
          JSON.stringify(businessCombinationResult),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      }
      console.log("✅ No business combination duplicates found, continuing...");
    }

    // Individual field checks for business accounts (lower priority)
    if (accountType === 'business') {
      console.log("🏢 Checking individual business fields...");
      const individualFieldResult = await checkIndividualBusinessFields(supabaseAdmin, businessName, address);
      if (individualFieldResult) {
        console.log("🚨 INDIVIDUAL FIELD DUPLICATE FOUND, returning result");
        console.log("🏢 Individual field result:", JSON.stringify(individualFieldResult, null, 2));
        console.log(`=== DUPLICATE CHECK END (${individualFieldResult.duplicateType?.toUpperCase()} FOUND) ===`);
        return new Response(
          JSON.stringify(individualFieldResult),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      }
      console.log("✅ No individual field duplicates found, continuing...");
    }

    console.log("🎉 No duplicates found within account type:", accountType);
    console.log("=== DUPLICATE CHECK END (AVAILABLE) ===");

    const noDuplicateResponse: DuplicateCheckResponse = {
      isDuplicate: false,
      duplicateType: null,
      allowContinue: false
    };

    console.log("📤 Returning no duplicate response:", JSON.stringify(noDuplicateResponse, null, 2));
    return new Response(
      JSON.stringify(noDuplicateResponse),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

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
