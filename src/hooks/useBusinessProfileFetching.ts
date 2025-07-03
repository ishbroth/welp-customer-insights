
import { supabase } from "@/integrations/supabase/client";

export const useBusinessProfileFetching = () => {
  const fetchBusinessProfiles = async (reviews: any[]) => {
    const businessIds = [...new Set(reviews.map(review => review.business_id).filter(Boolean))];
    let businessProfilesMap = new Map();
    let businessVerificationMap = new Map();

    console.log('🏢 fetchBusinessProfiles: Starting fetch for IDs:', businessIds);

    if (businessIds.length > 0) {
      // Fetch business profiles
      const { data: businessProfiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, name, avatar, type, state')
        .in('id', businessIds)
        .eq('type', 'business');

      if (profileError) {
        console.error('❌ Error fetching business profiles:', profileError);
      } else {
        console.log('✅ Business profiles fetched:', businessProfiles?.length || 0);
        businessProfiles?.forEach(profile => {
          businessProfilesMap.set(profile.id, profile);
          console.log(`✅ Profile mapped: ${profile.id} -> ${profile.name}`);
        });
      }

      // Fetch business verification status
      const { data: businessInfos, error: businessError } = await supabase
        .from('business_info')
        .select('id, verified, business_name')
        .in('id', businessIds);

      if (businessError) {
        console.error('❌ Error fetching business verification:', businessError);
      } else {
        console.log('✅ Business verification data fetched:', businessInfos?.length || 0);
        businessInfos?.forEach(business => {
          const isVerified = Boolean(business.verified);
          businessVerificationMap.set(business.id, isVerified);
          console.log(`✅ VERIFICATION: Business ${business.id} -> verified: ${isVerified}`);
          
          // Enhance existing profile with verification status
          if (businessProfilesMap.has(business.id)) {
            const existingProfile = businessProfilesMap.get(business.id);
            existingProfile.verified = isVerified;
            existingProfile.business_name = business.business_name;
            businessProfilesMap.set(business.id, existingProfile);
            console.log(`✅ ENHANCED: Profile ${business.id} now has verification: ${isVerified}`);
          }
        });
      }
    }

    console.log('🏢 fetchBusinessProfiles: Final maps', {
      profilesCount: businessProfilesMap.size,
      verificationsCount: businessVerificationMap.size
    });

    return { businessProfilesMap, businessVerificationMap };
  };

  return { fetchBusinessProfiles };
};
