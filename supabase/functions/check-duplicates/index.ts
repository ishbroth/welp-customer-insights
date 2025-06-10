
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, phone, businessName, address } = await req.json()
    
    console.log("=== DUPLICATE CHECK EDGE FUNCTION START ===");
    console.log("Checking duplicates for:", { email, phone, businessName, address });

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

    // Check email duplicates
    if (email) {
      const { data: emailProfile, error: emailError } = await supabaseAdmin
        .from('profiles')
        .select('id, email, name, type, phone')
        .eq('email', email)
        .maybeSingle();

      console.log("Email check result:", { emailProfile, emailError });

      if (emailProfile) {
        console.log("=== DUPLICATE CHECK END (EMAIL FOUND) ===");
        return new Response(
          JSON.stringify({
            isDuplicate: true,
            duplicateType: 'email',
            existingEmail: email,
            allowContinue: false
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      }
    }

    // Check phone duplicates
    if (phone) {
      // Clean phone for comparison
      const cleanedPhone = phone.replace(/\D/g, '');
      console.log("Checking phone:", phone, "cleaned:", cleanedPhone);

      // Get all profiles with phones and check
      const { data: allProfiles, error: profilesError } = await supabaseAdmin
        .from('profiles')
        .select('id, phone, email, name, type')
        .not('phone', 'is', null);

      console.log("All profiles with phones:", allProfiles?.length, profilesError);

      if (allProfiles) {
        for (const profile of allProfiles) {
          if (profile.phone) {
            const profileCleanedPhone = profile.phone.replace(/\D/g, '');
            console.log(`Comparing: ${cleanedPhone} vs ${profileCleanedPhone}`);
            
            if (profileCleanedPhone === cleanedPhone) {
              console.log("Found phone match:", profile);
              console.log("=== DUPLICATE CHECK END (PHONE FOUND) ===");
              return new Response(
                JSON.stringify({
                  isDuplicate: true,
                  duplicateType: 'phone',
                  existingPhone: phone,
                  existingEmail: profile.email,
                  allowContinue: true
                }),
                { 
                  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                  status: 200 
                }
              );
            }
          }
        }
      }
    }

    // Check address duplicates if provided
    if (address) {
      const { data: addressProfile, error: addressError } = await supabaseAdmin
        .from('profiles')
        .select('id, address, email, name, type')
        .eq('address', address)
        .maybeSingle();

      console.log("Address check result:", { addressProfile, addressError });

      if (addressProfile) {
        console.log("=== DUPLICATE CHECK END (ADDRESS FOUND) ===");
        return new Response(
          JSON.stringify({
            isDuplicate: true,
            duplicateType: 'address',
            existingAddress: address,
            existingEmail: addressProfile.email,
            allowContinue: true
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      }
    }

    console.log("No duplicates found");
    console.log("=== DUPLICATE CHECK END (AVAILABLE) ===");

    return new Response(
      JSON.stringify({
        isDuplicate: false,
        duplicateType: null,
        allowContinue: false
      }),
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
