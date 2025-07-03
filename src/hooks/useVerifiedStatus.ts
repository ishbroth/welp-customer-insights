
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useVerifiedStatus = (businessId?: string) => {
  const { data: isVerified = false } = useQuery({
    queryKey: ['businessVerified', businessId],
    queryFn: async () => {
      if (!businessId) return false;
      
      console.log(`useVerifiedStatus: Checking verification for business ID: ${businessId}`);
      
      try {
        const { data, error } = await supabase
          .from('business_info')
          .select('verified')
          .eq('id', businessId)
          .maybeSingle();

        if (error) {
          console.error("useVerifiedStatus: Error fetching business verification:", error);
          return false;
        }

        const verified = data?.verified || false;
        console.log(`useVerifiedStatus: Business ${businessId} verified status: ${verified}`);
        return verified;
      } catch (error) {
        console.error("useVerifiedStatus: Unexpected error:", error);
        return false;
      }
    },
    enabled: !!businessId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  });

  return { isVerified };
};
