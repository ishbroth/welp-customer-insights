
import { supabase } from "@/integrations/supabase/client";

export const handleSubscription = async (
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>,
  setIsSubscribed: (value: boolean) => void,
  toast: (props: { 
    title: string;
    description: string;
    variant?: "default" | "destructive";
  }) => void,
  isCustomer: boolean,
  currentUser?: any
): Promise<void> => {
  return new Promise(async (resolve) => {
    console.log("🔥 handleSubscription function called with isCustomer:", isCustomer);
    
    setIsProcessing(true);
    
    try {
      // Check if we have a current user passed in
      if (!currentUser) {
        console.error("❌ No current user provided");
        toast({
          title: "Authentication Error",
          description: "Please log in to subscribe.",
          variant: "destructive"
        });
        setIsProcessing(false);
        resolve();
        return;
      }
      
      console.log("✅ Current user found, starting subscription process for user:", currentUser.email);
      
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
      
      console.log("🚀 Subscription - Opening Stripe checkout in new tab:", data.url);
      
      // Open Stripe checkout in a new tab to avoid iframe restrictions
      const newWindow = window.open(data.url, '_blank');
      
      if (newWindow) {
        toast({
          title: "Checkout Opened",
          description: "Stripe checkout has opened in a new tab. Complete your payment there and return to this page.",
        });
      } else {
        toast({
          title: "Popup Blocked",
          description: "Please allow popups for this site and try again, or copy this URL to complete your payment: " + data.url,
          variant: "destructive"
        });
      }
      
      // Reset processing state since user will complete checkout in new tab
      setIsProcessing(false);
      resolve();
      
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
    
    console.log("Opening customer portal in new tab:", data.url);
    // Open Stripe customer portal in a new tab
    const newWindow = window.open(data.url, '_blank');
    if (!newWindow) {
      throw new Error("Popup blocked. Please allow popups for this site.");
    }
  } catch (error) {
    console.error("Error opening customer portal:", error);
    throw error;
  }
};
