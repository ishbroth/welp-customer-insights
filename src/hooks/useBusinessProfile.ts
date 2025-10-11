
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BusinessProfile } from "@/types/business";
import { logger } from '@/utils/logger';

const hookLogger = logger.withContext('useBusinessProfile');

export const useBusinessProfile = (businessId: string | undefined, hasAccess: boolean) => {
  const { toast } = useToast();
  
  const { 
    data: businessProfile, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['businessProfile', businessId],
    queryFn: async () => {
      // First check if user has access to view this business profile
      if (!hasAccess && !businessId) {
        throw new Error('Subscription required to view business profiles');
      }

      hookLogger.info("Fetching business profile for ID:", businessId);
      
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
      
      if (error) {
        hookLogger.error("Error fetching business profile:", error);
        throw error;
      }

      hookLogger.debug("Business profile data:", data);
      return data as BusinessProfile;
    },
    enabled: !!businessId && hasAccess,
    retry: 1
  });

  // Show toast only for certain types of errors, not for profile not found
  if (error && !error.message.includes('No rows returned')) {
    hookLogger.error("Business profile query error:", error);
    toast({
      title: "Error",
      description: "Failed to load business profile information.",
      variant: "destructive"
    });
  }

  return {
    businessProfile,
    isLoading,
    error: error as Error | null,
    refetch
  };
};
