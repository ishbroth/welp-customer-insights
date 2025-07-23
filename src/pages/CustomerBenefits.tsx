import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { handleSubscription } from "@/services/subscriptionService";
import { supabase } from "@/integrations/supabase/client";

const CustomerBenefits = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { currentUser, setIsSubscribed } = useAuth();
  const isCustomer = currentUser?.type === "customer";

  const handleSubscribeClick = async () => {
    console.log("🔥 Subscribe button clicked! isProcessing:", isProcessing, "isCustomer:", isCustomer);
    
    if (isProcessing) {
      console.log("⏳ Already processing, ignoring click");
      return;
    }
    
    console.log("📞 About to call handleSubscription");
    await handleSubscription(setIsProcessing, setIsSubscribed, toast, isCustomer, currentUser);
  };

  const handleLegacySubscribeClick = async () => {
    console.log("🔥 Legacy Subscribe button clicked! isProcessing:", isProcessing, "isCustomer:", isCustomer);
    
    if (isProcessing) {
      console.log("⏳ Already processing, ignoring click");
      return;
    }
    
    if (!currentUser) {
      toast({
        title: "Authentication Error",
        description: "Please log in to purchase a lifetime subscription.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      console.log("📞 About to call create-legacy-payment");
      const { data, error } = await supabase.functions.invoke("create-legacy-payment", {
        body: { userType: isCustomer ? "customer" : "business" }
      });
      
      if (error) {
        console.error("❌ Legacy payment error:", error);
        toast({
          title: "Payment Error",
          description: error.message || "Failed to create payment session. Please try again.",
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }
      
      if (data?.url) {
        console.log("🚀 Legacy - Redirecting to Stripe checkout URL:", data.url);
        window.location.href = data.url;
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
      console.error("❌ Legacy subscription error:", error);
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "An error occurred while processing your payment. Please try again.",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <h1>Customer Benefits Page</h1>
      <button onClick={handleSubscribeClick} disabled={isProcessing}>
        {isProcessing ? "Processing..." : "Subscribe"}
      </button>
      <button onClick={handleLegacySubscribeClick} disabled={isProcessing}>
        {isProcessing ? "Processing..." : "Get Legacy Subscription"}
      </button>
    </div>
  );
};

export default CustomerBenefits;
