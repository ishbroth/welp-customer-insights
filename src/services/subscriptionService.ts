
import { supabase } from "@/integrations/supabase/client";

export const openCustomerPortal = async () => {
  try {
    console.log("Opening customer portal...");
    
    const { data, error } = await supabase.functions.invoke("customer-portal");
    
    if (error) {
      console.error("Error opening customer portal:", error);
      throw error;
    }
    
    if (data?.url) {
      console.log("Redirecting to customer portal:", data.url);
      window.open(data.url, '_blank');
    } else {
      throw new Error("No portal URL received");
    }
  } catch (error) {
    console.error("Failed to open customer portal:", error);
    throw error;
  }
};

export const handleSubscription = async (
  setIsProcessing: (processing: boolean) => void,
  setIsSubscribed: (subscribed: boolean) => void,
  toast: any,
  isCustomer: boolean,
  currentUser: any
) => {
  console.log("🔥 handleSubscription called! isProcessing:", false, "isCustomer:", isCustomer);
  
  if (!currentUser) {
    toast({
      title: "Authentication Error",
      description: "Please log in to purchase a subscription.",
      variant: "destructive"
    });
    return;
  }

  setIsProcessing(true);
  
  try {
    console.log("📞 About to call create-checkout");
    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: { userType: isCustomer ? "customer" : "business" }
    });
    
    if (error) {
      console.error("❌ Payment error:", error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to create payment session. Please try again.",
        variant: "destructive"
      });
      setIsProcessing(false);
      return;
    }
    
    if (data?.url) {
      console.log("🚀 Opening Stripe checkout in new tab:", data.url);
      
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
    } else {
      console.error("❌ No checkout URL returned:", data);
      toast({
        title: "Payment Error",
        description: "Failed to create payment session. Please try again.",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  } catch (error) {
    console.error("❌ Subscription error:", error);
    toast({
      title: "Payment Error",
      description: error instanceof Error ? error.message : "An error occurred while processing your payment. Please try again.",
      variant: "destructive"
    });
    setIsProcessing(false);
  }
};
