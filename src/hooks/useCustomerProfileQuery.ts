
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/utils/logger';

const hookLogger = logger.withContext('CustomerProfileQuery');

export const useCustomerProfileQuery = (customerId: string | undefined) => {
  return useQuery({
    queryKey: ['customerProfile', customerId],
    queryFn: async () => {
      if (!customerId) {
        hookLogger.debug(`No customer ID provided`);
        return null;
      }
      
      hookLogger.debug(`Fetching customer profile for ID: ${customerId}`);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, avatar, first_name, last_name, name, phone, verified')
        .eq('id', customerId)
        .maybeSingle();

      if (error) {
        hookLogger.error("Error fetching customer profile:", error);
        return null;
      }

      hookLogger.debug(`Customer profile result:`, data);
      return data;
    },
    enabled: !!customerId,
    retry: 2
  });
};
