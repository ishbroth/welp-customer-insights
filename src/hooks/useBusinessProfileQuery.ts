
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/utils/logger';

const hookLogger = logger.withContext('useBusinessProfileQuery');

export const useBusinessProfileQuery = (reviewerId: string) => {
  return useQuery({
    queryKey: ['businessProfile', reviewerId],
    queryFn: async () => {
      hookLogger.info(`Fetching business profile for ID: ${reviewerId}`);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, avatar, name, phone, address, city, state, zipcode, verified')
        .eq('id', reviewerId)
        .maybeSingle();

      if (error) {
        hookLogger.error("Error fetching business profile:", error);
        return null;
      }

      hookLogger.debug(`Business profile result:`, data);
      return data;
    },
    enabled: !!reviewerId
  });
};
