
import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/utils/logger';

const hookLogger = logger.withContext('useBusinessProfileFetching');

export const useBusinessProfileFetching = () => {
  const fetchBusinessProfiles = async (reviews: any[]) => {
    const businessIds = [...new Set(reviews.map(review => review.business_id).filter(Boolean))];
    let businessProfilesMap = new Map();
    let businessVerificationMap = new Map();

    hookLogger.info('fetchBusinessProfiles: Starting fetch for IDs:', businessIds);

    if (businessIds.length > 0) {
      // Fetch business profiles
      const { data: businessProfiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, name, avatar, type, state, verified')
        .in('id', businessIds)
        .eq('type', 'business');

      if (profileError) {
        hookLogger.error('Error fetching business profiles:', profileError);
      } else {
        hookLogger.debug('Business profiles fetched:', businessProfiles?.length || 0);
        businessProfiles?.forEach(profile => {
          businessProfilesMap.set(profile.id, profile);
          hookLogger.debug(`Profile mapped: ${profile.id} -> ${profile.name}, profile verified: ${profile.verified}`);
        });
      }

      // CRITICAL: Fetch business verification status from business_info table (this is the authoritative source)
      const { data: businessInfos, error: businessError } = await supabase
        .from('business_info')
        .select('id, verified, business_name')
        .in('id', businessIds);

      if (businessError) {
        hookLogger.error('Error fetching business verification:', businessError);
      } else {
        hookLogger.debug('Business info successfully fetched:', businessInfos?.length || 0);
        businessInfos?.forEach(business => {
          const isVerified = Boolean(business.verified);
          businessVerificationMap.set(business.id, isVerified);
          hookLogger.debug(`VERIFICATION MAPPED: Business ${business.id} -> verified: ${isVerified} (from business_info table)`);
          
          // CRITICAL: Enhance existing profile with authoritative verification status from business_info
          if (businessProfilesMap.has(business.id)) {
            const existingProfile = businessProfilesMap.get(business.id);
            existingProfile.verified = isVerified; // Override with business_info verification (authoritative)
            existingProfile.business_name = business.business_name;
            businessProfilesMap.set(business.id, existingProfile);
            hookLogger.debug(`ENHANCED PROFILE: ${business.id} verification OVERRIDDEN to: ${isVerified} (from business_info)`);
          } else {
            // Create a minimal profile if we only have business_info data
            hookLogger.debug(`Creating minimal profile for business ${business.id} with verification: ${isVerified}`);
            businessProfilesMap.set(business.id, {
              id: business.id,
              name: business.business_name || 'Business',
              verified: isVerified,
              type: 'business'
            });
          }
        });
      }
    }

    hookLogger.debug('fetchBusinessProfiles: Final verification map:',
      Array.from(businessVerificationMap.entries()).map(([id, verified]) => ({ id, verified }))
    );

    hookLogger.debug('fetchBusinessProfiles: Final profiles map:', 
      Array.from(businessProfilesMap.entries()).map(([id, profile]) => ({ 
        id, 
        name: profile.name, 
        verified: profile.verified 
      }))
    );

    return { businessProfilesMap, businessVerificationMap };
  };

  return { fetchBusinessProfiles };
};
