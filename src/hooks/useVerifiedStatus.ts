
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useVerifiedStatus = (userId: string | undefined) => {
  const { data: isVerified, isLoading } = useQuery({
    queryKey: ['verifiedStatus', userId],
    queryFn: async () => {
      if (!userId) return false;
      
      const { data, error } = await supabase
        .from('business_info')
        .select('verified')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error("Error fetching verification status:", error);
        return false;
      }
      
      return data?.verified || false;
    },
    enabled: !!userId,
    retry: 1
  });

  return { isVerified: isVerified || false, isLoading };
};
