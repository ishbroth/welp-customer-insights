
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

    // Check for email duplicates ACROSS ALL ACCOUNT TYPES
    if (email) {
      console.log("🔍 Checking email duplicates across all account types...");
      const emailDuplicate = await checkEmailDuplicates(supabaseAdmin, email, null); // Pass null to check all types
      if (emailDuplicate) {
        console.log("📧 EMAIL DUPLICATE FOUND:", emailDuplicate);
        console.log("=== DUPLICATE CHECK END (EMAIL DUPLICATE) ===");
        return new Response(
          JSON.stringify(emailDuplicate),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      }
    }

    // Check for phone duplicates WITHIN ACCOUNT TYPE
    if (phone && accountType) {
      console.log(`🔍 Checking phone duplicates within ${accountType} accounts only...`);
      const phoneDuplicate = await checkPhoneDuplicates(supabaseAdmin, phone, accountType);
      if (phoneDuplicate) {
        console.log("📱 PHONE DUPLICATE FOUND:", phoneDuplicate);
        console.log("=== DUPLICATE CHECK END (PHONE DUPLICATE) ===");
        return new Response(
          JSON.stringify(phoneDuplicate),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      }
    }

    // For business accounts, check additional business-specific duplicates
    if (accountType === 'business' && businessName) {
      console.log("🏢 Checking business-specific duplicates...");
      
      // Check business combination duplicates
      if (address) {
        const businessCombinationDuplicate = await checkBusinessCombinationDuplicates(supabaseAdmin, businessName, address);
        if (businessCombinationDuplicate) {
          console.log("🏢 BUSINESS COMBINATION DUPLICATE FOUND:", businessCombinationDuplicate);
          console.log("=== DUPLICATE CHECK END (BUSINESS COMBINATION DUPLICATE) ===");
          return new Response(
            JSON.stringify(businessCombinationDuplicate),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200 
            }
          );
        }
      }

      // Check individual business fields
      const individualBusinessDuplicate = await checkIndividualBusinessFields(supabaseAdmin, businessName, address);
      if (individualBusinessDuplicate) {
        console.log("🏢 INDIVIDUAL BUSINESS FIELD DUPLICATE FOUND:", individualBusinessDuplicate);
        console.log("=== DUPLICATE CHECK END (INDIVIDUAL BUSINESS DUPLICATE) ===");
        return new Response(
          JSON.stringify(individualBusinessDuplicate),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      }
    }

    // No duplicates found
    console.log("✅ No duplicates found");
    console.log("=== DUPLICATE CHECK END (NO DUPLICATES) ===");
    
    const noDuplicateResponse: DuplicateCheckResponse = {
      isDuplicate: false,
      duplicateType: null,
      allowContinue: false
    };

    return new Response(
      JSON.stringify(noDuplicateResponse),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('💥 Error in duplicate check:', error);
    console.error('💥 Error stack:', error.stack);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        debug_info: {
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
