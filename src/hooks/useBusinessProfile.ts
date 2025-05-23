
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BusinessProfile } from "@/types/business";

export const useBusinessProfile = (businessId: string | undefined, hasAccess: boolean) => {
  const { toast } = useToast();
  
  const { data: businessProfile, isLoading } = useQuery({
    queryKey: ['businessProfile', businessId],
    queryFn: async () => {
      try {
        // First check if user has access to view this business profile
        if (!hasAccess && !businessId) {
          throw new Error('Subscription required to view business profiles');
        }
        
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id, 
            name,
            phone,
            address,
            city,
            state,
            zipcode,
            avatar,
            bio,
            business_info:business_info(*)
          `)
          .eq('id', businessId)
          .eq('type', 'business')
          .single();
        
        if (error) throw error;
        return data as BusinessProfile;
      } catch (error) {
        console.error("Error fetching business profile:", error);
        toast({
          title: "Error",
          description: "Failed to load business profile information.",
          variant: "destructive"
        });
        return null;
      }
    },
    enabled: !!businessId && hasAccess
  });

  return {
    businessProfile,
    isLoading
  };
};
