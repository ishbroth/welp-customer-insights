
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { SubscriptionPlans } from "@/components/subscription/SubscriptionPlans";
import SubscriptionFAQ from "@/components/subscription/SubscriptionFAQ";
import { handleSubscription } from "@/services/subscriptionService";
import { supabase } from "@/integrations/supabase/client";

const Subscription = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const location = useLocation();
  const { currentUser, setIsSubscribed } = useAuth();
  const isCustomer = currentUser?.type === "customer";

  // Determine if we came from a specific review
  const [fromReviewId, setFromReviewId] = useState<string | null>(null);
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const reviewId = params.get("reviewId");
    const canceled = params.get("canceled");
    
    if (reviewId) {
      setFromReviewId(reviewId);
    }
    
    if (canceled) {
      toast({
        title: "Subscription Canceled",
        description: "Your subscription process was canceled. You can try again when you're ready.",
      });
    }
  }, [location]);

  const handleSubscribeClick = async () => {
    console.log("🔥 Subscribe button clicked! isProcessing:", isProcessing, "isCustomer:", isCustomer);
    
    if (isProcessing) {
      console.log("⏳ Already processing, ignoring click");
      return;
    }
    
    console.log("📞 About to call handleSubscription");
    await handleSubscription(setIsProcessing, setIsSubscribed, toast, isCustomer);
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
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-3">Welp. Subscription</h1>
            
            {isCustomer ? (
              <p className="text-center text-xl mb-10 text-gray-600">
                Access all reviews about you and respond to businesses
              </p>
            ) : (
              <p className="text-center text-xl mb-10 text-gray-600">
                Access the full customer database and make informed business decisions
              </p>
            )}
            
            <SubscriptionPlans 
              type={isCustomer ? "customer" : "business"}
              isProcessing={isProcessing}
              handleSubscribe={handleSubscribeClick}
              handleLegacySubscribe={handleLegacySubscribeClick}
            />
            
            <SubscriptionFAQ isCustomer={isCustomer} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Subscription;
