
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";

/**
 * Hook for managing subscription status
 */
export const useSubscriptionStatus = (
  currentUser: User | null,
  setIsSubscribed: (subscribed: boolean) => void
) => {
  // Fetch subscription status from Stripe when user changes
  useEffect(() => {
    const checkUserSubscription = async () => {
      if (!currentUser) {
        setIsSubscribed(false);
        return;
      }
      
      try {
        // Call our edge function to check subscription status
        const { data, error } = await supabase.functions.invoke("check-subscription");
        
        if (error) {
          console.error("❌ Error checking subscription with Stripe:", error);
          return;
        }
        
        setIsSubscribed(data?.subscribed || false);
        console.log("💳 Subscription status updated from Stripe:", data?.subscribed);
      } catch (error) {
        console.error("❌ Error in checkUserSubscription:", error);
      }
    };

    checkUserSubscription();
  }, [currentUser, setIsSubscribed]);
};
