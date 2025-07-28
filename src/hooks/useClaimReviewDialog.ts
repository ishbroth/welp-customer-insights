
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useClaimReviewDialog = (businessId?: string, open?: boolean) => {
  // Fetch comprehensive business profile data
  const { data: fullBusinessProfile } = useQuery({
    queryKey: ['fullBusinessProfile', businessId],
    queryFn: async () => {
      if (!businessId) return null;
      
      console.log("Fetching full business profile for claim dialog:", businessId);
      
      // First get the profile data
      const { data: profileData, error: profileError } = await supabase
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
          verified
        `)
        .eq('id', businessId)
        .eq('type', 'business')
        .maybeSingle();
      
      if (profileError) {
        console.error("Error fetching business profile:", profileError);
        return null;
      }

      // Then get the business info data
      const { data: businessInfoData, error: businessInfoError } = await supabase
        .from('business_info')
        .select(`
          business_name,
          website,
          business_category,
          business_subcategory,
          license_type,
          license_number,
          license_state,
          verified
        `)
        .eq('id', businessId)
        .maybeSingle();

      if (businessInfoError) {
        console.error("Error fetching business info:", businessInfoError);
      }

      // Combine the data
      const combinedData = {
        ...profileData,
        business_info: businessInfoData
      };
      
      console.log("Full business profile fetched:", combinedData);
      return combinedData;
    },
    enabled: !!businessId && open,
  });

  return { fullBusinessProfile };
};
