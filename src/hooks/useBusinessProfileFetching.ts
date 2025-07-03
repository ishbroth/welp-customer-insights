
import { supabase } from "@/integrations/supabase/client";

export const useBusinessProfileFetching = () => {
  const fetchBusinessProfiles = async (reviews: any[]) => {
    const businessIds = [...new Set(reviews.map(review => review.business_id).filter(Boolean))];
    let businessProfilesMap = new Map();
    let businessVerificationMap = new Map();

    if (businessIds.length > 0) {
      // Fetch business profiles
      const { data: businessProfiles } = await supabase
        .from('profiles')
        .select('id, name, avatar, type, state')
        .in('id', businessIds)
        .eq('type', 'business');

      businessProfiles?.forEach(profile => {
        businessProfilesMap.set(profile.id, profile);
      });

      // Fetch business verification status
      const { data: businessInfos } = await supabase
        .from('business_info')
        .select('id, verified, business_name')
        .in('id', businessIds);

      businessInfos?.forEach(business => {
        const isVerified = Boolean(business.verified);
        businessVerificationMap.set(business.id, isVerified);
        
        // Enhance existing profile with verification status
        if (businessProfilesMap.has(business.id)) {
          const existingProfile = businessProfilesMap.get(business.id);
          existingProfile.verified = isVerified;
          existingProfile.business_name = business.business_name;
          businessProfilesMap.set(business.id, existingProfile);
        }
      });
    }

    return { businessProfilesMap, businessVerificationMap };
  };

  return { fetchBusinessProfiles };
};
