// Diagnostic utility to check if business profiles have city/state data
import { supabase } from "@/integrations/supabase/client";

export async function checkBusinessProfilesCityState() {
  console.log("🔍 DIAGNOSTIC: Checking business profiles for city/state data...");

  // Get a sample of business profiles
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, name, city, state, type')
    .eq('type', 'business')
    .limit(20);

  if (error) {
    console.error("❌ Error fetching business profiles:", error);
    return;
  }

  if (!profiles || profiles.length === 0) {
    console.log("⚠️ No business profiles found in database");
    return;
  }

  console.log(`📊 Found ${profiles.length} business profiles. Analyzing city/state data...`);

  let hasCity = 0;
  let hasState = 0;
  let hasBoth = 0;
  let hasNeither = 0;

  profiles.forEach(profile => {
    const cityExists = !!profile.city;
    const stateExists = !!profile.state;

    if (cityExists) hasCity++;
    if (stateExists) hasState++;
    if (cityExists && stateExists) hasBoth++;
    if (!cityExists && !stateExists) hasNeither++;

    console.log(`👤 ${profile.name}:`, {
      id: profile.id,
      city: profile.city || '[MISSING]',
      state: profile.state || '[MISSING]',
      hasCity: cityExists,
      hasState: stateExists
    });
  });

  console.log("\n📈 SUMMARY:");
  console.log(`  ✅ Has city: ${hasCity}/${profiles.length} (${Math.round(hasCity/profiles.length*100)}%)`);
  console.log(`  ✅ Has state: ${hasState}/${profiles.length} (${Math.round(hasState/profiles.length*100)}%)`);
  console.log(`  ✅ Has both: ${hasBoth}/${profiles.length} (${Math.round(hasBoth/profiles.length*100)}%)`);
  console.log(`  ❌ Has neither: ${hasNeither}/${profiles.length} (${Math.round(hasNeither/profiles.length*100)}%)`);

  if (hasNeither > 0 || hasBoth < profiles.length) {
    console.log("\n⚠️ ISSUE DETECTED: Some business profiles are missing city/state data!");
    console.log("   This is why city/state isn't displaying in review cards.");
    console.log("   Business profiles need to have their city and state populated.");
  } else {
    console.log("\n✅ All business profiles have city and state data!");
    console.log("   Issue must be elsewhere in the data pipeline.");
  }

  return {
    total: profiles.length,
    hasCity,
    hasState,
    hasBoth,
    hasNeither,
    profiles
  };
}

// Expose to browser console for easy testing
if (typeof window !== 'undefined') {
  (window as any).checkBusinessCityState = checkBusinessProfilesCityState;
}
