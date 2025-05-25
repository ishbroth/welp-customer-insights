
import { supabase } from "@/integrations/supabase/client";

export const handleSubscription = async (
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>,
  setIsSubscribed: (value: boolean) => void,
  toast: (props: { 
    title: string;
    description: string;
    variant?: "default" | "destructive";
  }) => void,
  isCustomer: boolean
): Promise<void> => {
  return new Promise(async (resolve) => {
    setIsProcessing(true);
    
    try {
      // Get current user session from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session || !session.user) {
        toast({
          title: "Authentication Error",
          description: "Please log in to subscribe.",
          variant: "destructive"
        });
        setIsProcessing(false);
        resolve();
        return;
      }
      
      // Call the create-checkout edge function
      const userType = isCustomer ? "customer" : "business";
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { userType },
      });
      
      if (error) {
        throw error;
      }
      
      if (!data?.url) {
        throw new Error("No checkout URL returned");
      }
      
      // Determine success URL based on current page
      const currentUrl = window.location.href;
      const fromBilling = currentUrl.includes('from=billing');
      
      // Store the return context in sessionStorage for after Stripe redirect
      if (fromBilling) {
        sessionStorage.setItem('returnToBilling', 'true');
      }
      
      // Open Stripe checkout in current window
      window.location.href = data.url;
      
      console.log("Subscription - Redirecting to Stripe checkout");
      
      // We'll set subscription status after returning from Stripe
      setIsProcessing(false);
      resolve();
    } catch (error) {
      console.error("Subscription error:", error);
      toast({
        title: "Subscription Error",
        description: "An error occurred while processing your subscription. Please try again.",
        variant: "destructive"
      });
      setIsProcessing(false);
      resolve();
    }
  });
};

export const handleRedirectAfterSubscription = (isCustomer: boolean): void => {
  // No immediate redirect - the user will be redirected by Stripe to the success_url
  // This function is kept for API compatibility but is now a no-op
  console.log("Subscription redirect handled by Stripe");
};

export const checkSubscriptionStatus = async (userId: string): Promise<boolean> => {
  try {
    // Call the check-subscription edge function
    const { data, error } = await supabase.functions.invoke("check-subscription");
    
    if (error) {
      console.error("Error checking subscription status:", error);
      return false;
    }
    
    return data?.subscribed || false;
  } catch (error) {
    console.error("Unexpected error in checkSubscriptionStatus:", error);
    return false;
  }
};

export const openCustomerPortal = async (): Promise<void> => {
  try {
    console.log("Attempting to open customer portal...");
    const { data, error } = await supabase.functions.invoke("customer-portal");
    
    if (error) {
      console.error("Customer portal error:", error);
      throw error;
    }
    
    if (!data?.url) {
      throw new Error("No portal URL returned");
    }
    
    console.log("Opening customer portal URL:", data.url);
    // Open Stripe customer portal in the current window
    window.location.href = data.url;
  } catch (error) {
    console.error("Error opening customer portal:", error);
    throw error;
  }
};
