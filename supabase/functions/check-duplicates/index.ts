
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
    const { email, phone, businessName, address, accountType } = await req.json()
    
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
      const { data: emailProfile, error: emailError } = await supabaseAdmin
        .from('profiles')
        .select('id, email, name, type, phone, address')
        .eq('email', email)
        .eq('type', accountType)
        .maybeSingle();

      console.log("Email check result (filtered by account type):", { emailProfile, emailError, accountType });

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

    // Check phone duplicates within the same account type (second priority - always block)
    if (phone && accountType) {
      // Clean phone for comparison
      const cleanedPhone = phone.replace(/\D/g, '');
      console.log("Checking phone:", phone, "cleaned:", cleanedPhone, "for account type:", accountType);

      // Get all profiles with phones of the same account type
      const { data: allProfiles, error: profilesError } = await supabaseAdmin
        .from('profiles')
        .select('id, phone, email, name, type, address')
        .eq('type', accountType)
        .not('phone', 'is', null);

      console.log("All profiles with phones for account type:", accountType, allProfiles?.length, profilesError);

      if (allProfiles) {
        for (const profile of allProfiles) {
          if (profile.phone) {
            const profileCleanedPhone = profile.phone.replace(/\D/g, '');
            console.log(`Comparing: ${cleanedPhone} vs ${profileCleanedPhone} (account type: ${accountType})`);
            
            if (profileCleanedPhone === cleanedPhone) {
              console.log("Found phone match:", profile);
              console.log("=== DUPLICATE CHECK END (PHONE FOUND) ===");
              return new Response(
                JSON.stringify({
                  isDuplicate: true,
                  duplicateType: 'phone',
                  existingPhone: phone,
                  existingEmail: profile.email,
                  allowContinue: false
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

    // For business accounts, check if combination of details matches existing business
    if (accountType === 'business' && businessName && address) {
      console.log("Checking business combination for:", { businessName, address });
      
      // Get all business profiles and check for matches
      const { data: businessProfiles, error: businessError } = await supabaseAdmin
        .from('profiles')
        .select('id, name, address, email, phone, type')
        .eq('type', 'business');

      console.log("All business profiles:", businessProfiles?.length, businessError);

      if (businessProfiles) {
        for (const profile of businessProfiles) {
          let matchCount = 0;
          const matches = [];

          // Check business name similarity (case insensitive)
          if (profile.name && businessName) {
            const profileNameLower = profile.name.toLowerCase().trim();
            const businessNameLower = businessName.toLowerCase().trim();
            if (profileNameLower.includes(businessNameLower) || businessNameLower.includes(profileNameLower)) {
              matchCount++;
              matches.push('business_name');
            }
          }

          // Check address match
          if (profile.address && address) {
            if (profile.address.toLowerCase().trim() === address.toLowerCase().trim()) {
              matchCount++;
              matches.push('address');
            }
          }

          // If we have 2 or more matches, this is likely the same business
          if (matchCount >= 2) {
            console.log("Found business combination match:", { profile, matches, matchCount });
            console.log("=== DUPLICATE CHECK END (BUSINESS COMBINATION FOUND) ===");
            return new Response(
              JSON.stringify({
                isDuplicate: true,
                duplicateType: 'business_combination',
                existingEmail: profile.email,
                existingPhone: profile.phone,
                existingAddress: profile.address,
                matchedFields: matches,
                allowContinue: false
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

    // Individual field checks for business accounts (lower priority, allow continue)
    if (accountType === 'business') {
      // Check address duplicates within business accounts
      if (address) {
        const { data: addressProfile, error: addressError } = await supabaseAdmin
          .from('profiles')
          .select('id, address, email, name, type')
          .eq('address', address)
          .eq('type', 'business')
          .maybeSingle();

        console.log("Address check result (business accounts only):", { addressProfile, addressError });

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

      // Check business name duplicates within business accounts
      if (businessName) {
        const { data: businessProfile, error: businessError } = await supabaseAdmin
          .from('profiles')
          .select('id, name, email, type')
          .ilike('name', `%${businessName}%`)
          .eq('type', 'business')
          .maybeSingle();

        console.log("Business name check result (business accounts only):", { businessProfile, businessError });

        if (businessProfile) {
          console.log("=== DUPLICATE CHECK END (BUSINESS NAME FOUND) ===");
          return new Response(
            JSON.stringify({
              isDuplicate: true,
              duplicateType: 'business_name',
              existingEmail: businessProfile.email,
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

    console.log("No duplicates found within account type:", accountType);
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
