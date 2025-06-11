
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
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, phone, businessName, address, accountType }: DuplicateCheckRequest = await req.json()
    
    console.log("=== DUPLICATE CHECK EDGE FUNCTION START ===");
    console.log("Checking duplicates for:", { email, phone, businessName, address, accountType });

    // Create service role client that bypasses RLS
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

    // Check email duplicates within the same account type (highest priority - always block)
    if (email && accountType) {
      const emailResult = await checkEmailDuplicates(supabaseAdmin, email, accountType);
      if (emailResult) {
        console.log("=== DUPLICATE CHECK END (EMAIL FOUND) ===");
        return new Response(
          JSON.stringify(emailResult),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      }
    }

    // Check phone duplicates within the same account type (second priority - always block)
    if (phone && accountType) {
      const phoneResult = await checkPhoneDuplicates(supabaseAdmin, phone, accountType);
      if (phoneResult) {
        console.log("=== DUPLICATE CHECK END (PHONE FOUND) ===");
        return new Response(
          JSON.stringify(phoneResult),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      }
    }

    // For business accounts, check if combination of details matches existing business
    if (accountType === 'business' && businessName && address) {
      const businessCombinationResult = await checkBusinessCombinationDuplicates(supabaseAdmin, businessName, address);
      if (businessCombinationResult) {
        console.log("=== DUPLICATE CHECK END (BUSINESS COMBINATION FOUND) ===");
        return new Response(
          JSON.stringify(businessCombinationResult),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      }
    }

    // Individual field checks for business accounts (lower priority, allow continue)
    if (accountType === 'business') {
      const individualFieldResult = await checkIndividualBusinessFields(supabaseAdmin, businessName, address);
      if (individualFieldResult) {
        console.log(`=== DUPLICATE CHECK END (${individualFieldResult.duplicateType?.toUpperCase()} FOUND) ===`);
        return new Response(
          JSON.stringify(individualFieldResult),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      }
    }

    console.log("No duplicates found within account type:", accountType);
    console.log("=== DUPLICATE CHECK END (AVAILABLE) ===");

    const nosDuplicateResponse: DuplicateCheckResponse = {
      isDuplicate: false,
      duplicateType: null,
      allowContinue: false
    };

    return new Response(
      JSON.stringify(nosDuplicateResponse),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in duplicate check:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
})
