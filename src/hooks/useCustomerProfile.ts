
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";

export const useCustomerProfile = (customerId: string | undefined) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [customerProfile, setCustomerProfile] = useState<any | null>(null);
  const [customerReviews, setCustomerReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only business users can view customer profiles
    if (!currentUser || (currentUser.type !== 'business' && currentUser.type !== 'admin')) {
      toast({
        title: "Access Denied",
        description: "You need to be logged in as a business to view customer profiles.",
        variant: "destructive",
      });
      navigate('/');
      return;
    }

    const fetchCustomerProfile = async () => {
      if (!customerId) return;
      
      setIsLoading(true);
      
      try {
        // Get customer profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', customerId)
          .eq('type', 'customer')
          .single();
          
        if (profileError) {
          throw profileError;
        }
        
        if (!profileData) {
          toast({
            title: "Customer Not Found",
            description: "The customer profile you're looking for does not exist.",
            variant: "destructive",
          });
          navigate('/search');
          return;
        }
        
        setCustomerProfile(profileData);
        
        // Since customer_id was removed, we can't fetch customer-specific reviews
        // This functionality would need to be redesigned if needed
        setCustomerReviews([]);
        
      } catch (error: any) {
        console.error("Error fetching customer profile:", error);
        toast({
          title: "Error",
          description: "Failed to load customer profile. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCustomerProfile();
  }, [customerId, currentUser, navigate, toast]);

  // Check if user has access to full reviews
  const hasFullAccess = (customerId: string) => {
    // Business users always have full access
    return true;
  };

  return {
    customerProfile,
    customerReviews,
    isLoading,
    hasFullAccess
  };
};
