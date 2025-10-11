
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/utils/logger';

const hookLogger = logger.withContext('CustomerProfileData');

export const useCustomerProfileData = (customerId?: string, hasCustomerData?: boolean) => {
  return useQuery({
    queryKey: ['customerProfile', customerId],
    queryFn: async () => {
      if (!customerId) return null;
      
      hookLogger.debug(`Fetching customer profile for ID: ${customerId}`);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, avatar, first_name, last_name, name')
        .eq('id', customerId)
        .maybeSingle();

      if (error) {
        hookLogger.error("Error fetching customer profile:", error);
        return null;
      }

      hookLogger.debug(`Customer profile found:`, data);
      return data;
    },
    enabled: !!customerId && !hasCustomerData
  });
};
