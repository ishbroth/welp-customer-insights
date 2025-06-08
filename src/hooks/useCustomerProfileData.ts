
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCustomerProfileData = (customerId?: string, hasCustomerData?: boolean) => {
  return useQuery({
    queryKey: ['customerProfile', customerId],
    queryFn: async () => {
      if (!customerId) return null;
      
      console.log(`useCustomerProfileData: Fetching customer profile for ID: ${customerId}`);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, avatar, first_name, last_name, name')
        .eq('id', customerId)
        .maybeSingle();

      if (error) {
        console.error("useCustomerProfileData: Error fetching customer profile:", error);
        return null;
      }

      console.log(`useCustomerProfileData: Customer profile found:`, data);
      return data;
    },
    enabled: !!customerId && !hasCustomerData
  });
};
