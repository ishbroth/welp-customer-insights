
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useBusinessVerificationQuery = (reviewerId: string) => {
  return useQuery({
    queryKey: ['businessVerified', reviewerId],
    queryFn: async () => {
      if (!reviewerId) return false;
      
      console.log(`useBusinessVerificationQuery: Checking business verification for: ${reviewerId}`);
      
      const { data, error } = await supabase
        .from('business_info')
        .select('verified')
        .eq('id', reviewerId)
        .maybeSingle();
      
      if (error) {
        console.error("useBusinessVerificationQuery: Error fetching business verification:", error);
        return false;
      }
      
      console.log(`useBusinessVerificationQuery: Business verification result:`, data?.verified);
      return data?.verified || false;
    },
    enabled: !!reviewerId
  });
};
