
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/utils/logger';

const hookLogger = logger.withContext('CustomerVerificationFix');

export const useCustomerVerificationFix = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fixCustomerVerification = async () => {
      if (!currentUser || currentUser.type !== 'customer') return;
      
      hookLogger.debug("Checking customer verification status for:", currentUser.id);
      
      // Check current verification status
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('verified')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (error) {
        hookLogger.error("Error checking verification:", error);
        return;
      }

      hookLogger.debug("Current verification status:", profile?.verified);

      // If customer is not verified, automatically verify them
      // since they already completed phone verification to create the account
      if (profile && !profile.verified) {
        hookLogger.debug("Auto-verifying existing customer account...");
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ verified: true })
          .eq('id', currentUser.id);

        if (updateError) {
          hookLogger.error("Error updating verification:", updateError);
        } else {
          hookLogger.info("Customer account verified successfully!");
          toast({
            title: "Account Verified",
            description: "Your customer account has been verified!",
          });
        }
      }
    };

    fixCustomerVerification();
  }, [currentUser, toast]);
};
