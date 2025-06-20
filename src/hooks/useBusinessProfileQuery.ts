
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useBusinessProfileQuery = (reviewerId: string) => {
  return useQuery({
    queryKey: ['businessProfile', reviewerId],
    queryFn: async () => {
      console.log(`useBusinessProfileQuery: Fetching business profile for ID: ${reviewerId}`);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, avatar, name, phone, address, city, state, zipcode, verified')
        .eq('id', reviewerId)
        .maybeSingle();

      if (error) {
        console.error("useBusinessProfileQuery: Error fetching business profile:", error);
        return null;
      }
      
      console.log(`useBusinessProfileQuery: Business profile result:`, data);
      return data;
    },
    enabled: !!reviewerId
  });
};
