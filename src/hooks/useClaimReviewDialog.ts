
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useClaimReviewDialog = (businessId?: string, open?: boolean) => {
  // Fetch comprehensive business profile data
  const { data: fullBusinessProfile } = useQuery({
    queryKey: ['fullBusinessProfile', businessId],
    queryFn: async () => {
      if (!businessId) return null;
      
      console.log("Fetching full business profile for claim dialog:", businessId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          avatar,
          phone,
          address,
          city,
          state,
          zipcode,
          bio,
          business_info:business_info(
            business_name,
            website,
            business_category,
            business_subcategory
          )
        `)
        .eq('id', businessId)
        .eq('type', 'business')
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching full business profile:", error);
        return null;
      }
      
      console.log("Full business profile fetched:", data);
      return data;
    },
    enabled: !!businessId && open,
  });

  return { fullBusinessProfile };
};
