
import { supabase } from "@/integrations/supabase/client";
import { openStripeCheckout } from "@/utils/stripeCheckout";

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
      // Customer portal always opens in new tab for security
      window.open(data.url, '_blank');
    } else {
      throw new Error("No portal URL received");
    }
  } catch (error) {
    console.error("Failed to open customer portal:", error);
    throw error;
  }
};

export const processPaymentRefund = async (sessionId: string) => {
  try {
    console.log("Processing payment refund for session:", sessionId);
    
    const { data, error } = await supabase.functions.invoke("process-payment-refund", {
      body: { sessionId }
    });
    
    if (error) {
      console.error("Error processing payment refund:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Failed to process payment refund:", error);
    throw error;
  }
};

export const handleSubscription = async (
  setIsProcessing: (processing: boolean) => void,
  setIsSubscribed: (subscribed: boolean) => void,
  toast: any,
  isCustomer: boolean,
  currentUser: any,
  creditBalance: number = 0,
  isMobile: boolean = false
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
      console.log("🚀 Opening Stripe checkout:", data.url);
      
      // Use device-appropriate checkout method
      openStripeCheckout(data.url, isMobile);
      
      const creditValue = creditBalance * 3;
      const refundMessage = creditBalance > 0 
        ? ` After payment, you'll receive a $${Math.min(creditValue, 11.99).toFixed(2)} refund for your ${creditBalance} credit${creditBalance === 1 ? '' : 's'}.`
        : '';
      
      toast({
        title: isMobile ? "Redirecting to Checkout" : "Checkout Opened",
        description: isMobile 
          ? `Redirecting to Stripe checkout. Complete your payment and you'll be returned to this page.${refundMessage}`
          : `Stripe checkout has opened in a new tab. Complete your payment there and return to this page.${refundMessage}`,
      });
      
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
