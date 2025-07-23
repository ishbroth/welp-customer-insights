
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
    console.log("🔥 handleSubscription function called with isCustomer:", isCustomer);
    
    setIsProcessing(true);
    
    try {
      // Get current user session from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session || !session.user) {
        console.error("❌ No session found");
        toast({
          title: "Authentication Error",
          description: "Please log in to subscribe.",
          variant: "destructive"
        });
        setIsProcessing(false);
        resolve();
        return;
      }
      
      console.log("✅ Session found, starting subscription process for user:", session.user.email);
      
      // Call the create-checkout edge function
      const userType = isCustomer ? "customer" : "business";
      console.log("📞 Calling create-checkout with userType:", userType);
      
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { userType },
      });
      
      console.log("📋 Create-checkout response:", { data, error });
      
      if (error) {
        console.error("❌ Edge function error:", error);
        throw new Error(error.message || "Unknown error from create-checkout");
      }
      
      if (!data?.url) {
        console.error("❌ No checkout URL returned:", data);
        throw new Error("No checkout URL returned from Stripe");
      }
      
      console.log("🚀 Subscription - Redirecting to Stripe checkout URL:", data.url);
      
      // Add a small delay to ensure the UI updates before redirect
      setTimeout(() => {
        try {
          window.location.href = data.url;
        } catch (redirectError) {
          console.error("❌ Error redirecting to Stripe:", redirectError);
          toast({
            title: "Redirect Error",
            description: "Failed to redirect to Stripe checkout. Please try again.",
            variant: "destructive"
          });
          setIsProcessing(false);
          resolve();
        }
      }, 100);
      
    } catch (error) {
      console.error("❌ Subscription error:", error);
      toast({
        title: "Subscription Error",
        description: error instanceof Error ? error.message : "An error occurred while processing your subscription. Please try again.",
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
