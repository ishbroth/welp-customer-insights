
import { useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";

export const useCustomerVerificationFix = () => {
  const { currentUser } = useAuth();

  useEffect(() => {
    const fixCustomerVerification = async () => {
      if (!currentUser || currentUser.type !== 'customer') return;
      
      console.log("Checking customer verification status for:", currentUser.id);
      
      // Check current verification status
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('verified')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (error) {
        console.error("Error checking verification:", error);
        return;
      }

      console.log("Current verification status:", profile?.verified);

      // If customer is not verified, automatically verify them
      // since they already completed phone verification to create the account
      if (profile && !profile.verified) {
        console.log("Auto-verifying existing customer account...");
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ verified: true })
          .eq('id', currentUser.id);

        if (updateError) {
          console.error("Error updating verification:", updateError);
        } else {
          console.log("Customer account verified successfully!");
          // Removed toast notification - verification happens silently
        }
      }
    };

    fixCustomerVerification();
  }, [currentUser]);
};
