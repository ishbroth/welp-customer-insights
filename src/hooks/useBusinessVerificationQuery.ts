
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/utils/logger';

const hookLogger = logger.withContext('useBusinessVerificationQuery');

export const useBusinessVerificationQuery = (reviewerId: string) => {
  return useQuery({
    queryKey: ['businessVerified', reviewerId],
    queryFn: async () => {
      if (!reviewerId) return false;

      hookLogger.info(`Checking business verification for: ${reviewerId}`);
      
      const { data, error } = await supabase
        .from('business_info')
        .select('verified')
        .eq('id', reviewerId)
        .maybeSingle();
      
      if (error) {
        hookLogger.error("Error fetching business verification:", error);
        return false;
      }

      hookLogger.debug(`Business verification result:`, data?.verified);
      return data?.verified || false;
    },
    enabled: !!reviewerId
  });
};
