
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCustomerProfileQuery = (customerId: string | undefined) => {
  return useQuery({
    queryKey: ['customerProfile', customerId],
    queryFn: async () => {
      if (!customerId) {
        console.log(`useCustomerProfileQuery: No customer ID provided`);
        return null;
      }
      
      console.log(`useCustomerProfileQuery: Fetching customer profile for ID: ${customerId}`);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, avatar, first_name, last_name, name, phone, verified')
        .eq('id', customerId)
        .maybeSingle();

      if (error) {
        console.error("useCustomerProfileQuery: Error fetching customer profile:", error);
        return null;
      }

      console.log(`useCustomerProfileQuery: Customer profile result:`, data);
      return data;
    },
    enabled: !!customerId,
    retry: 2
  });
};
