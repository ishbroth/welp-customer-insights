
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/utils/logger';

export const useClaimReviewDialog = (businessId?: string) => {
  const hookLogger = logger.withContext('useClaimReviewDialog');
  // Fetch comprehensive business profile data
  const { data: fullBusinessProfile, isLoading } = useQuery({
    queryKey: ['fullBusinessProfile', businessId],
    queryFn: async () => {
      if (!businessId) return null;

      hookLogger.debug("Fetching full business profile for claim dialog:", businessId);

      // First get the profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          avatar,
          phone,
          address,
          city,
          state,
          zipcode,
          bio,
          verified
        `)
        .eq('id', businessId)
        .eq('type', 'business')
        .maybeSingle();

      if (profileError) {
        hookLogger.error("Error fetching business profile:", profileError);
        return null;
      }

      if (!profileData) {
        hookLogger.debug("No business profile found for ID:", businessId);
        return null;
      }

      // Then get the business info data
      const { data: businessInfoData, error: businessInfoError } = await supabase
        .from('business_info')
        .select(`
          business_name,
          website,
          business_category,
          business_subcategory,
          license_type,
          license_number,
          license_state,
          verified
        `)
        .eq('id', businessId)
        .maybeSingle();

      if (businessInfoError) {
        hookLogger.error("Error fetching business info:", businessInfoError);
      }

      // Combine the data
      const combinedData = {
        ...profileData,
        business_info: businessInfoData || {}
      };

      hookLogger.debug("Full business profile fetched for claim dialog:", combinedData);
      return combinedData;
    },
    enabled: !!businessId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  return { 
    fullBusinessProfile, 
    isLoading,
    hasData: !!fullBusinessProfile 
  };
};
