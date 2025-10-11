
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
import { useCredits } from "@/hooks/useCredits";
import { useIsMobile } from "@/hooks/use-mobile";
import { logger } from '@/utils/logger';

const Subscription = () => {
  const pageLogger = logger.withContext('Subscription');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const location = useLocation();
  const { currentUser, setIsSubscribed } = useAuth();
  const { balance: creditBalance } = useCredits();
  const isCustomer = currentUser?.type === "customer";
  const isMobile = useIsMobile();

  // Determine if we came from a specific review
  const [fromReviewId, setFromReviewId] = useState<string | null>(null);
  
  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
    
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
    pageLogger.debug("🔥 Subscribe button clicked! isProcessing:", isProcessing, "isCustomer:", isCustomer);

    if (isProcessing) {
      pageLogger.debug("⏳ Already processing, ignoring click");
      return;
    }

    pageLogger.debug("📞 About to call handleSubscription");
    await handleSubscription(setIsProcessing, setIsSubscribed, toast, isCustomer, currentUser, creditBalance, isMobile);
  };

  const handleLegacySubscribeClick = async () => {
    pageLogger.debug("🔥 Legacy Subscribe button clicked! isProcessing:", isProcessing, "isCustomer:", isCustomer);

    if (isProcessing) {
      pageLogger.debug("⏳ Already processing, ignoring click");
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
      pageLogger.debug("📞 About to call create-legacy-payment");
      const { data, error } = await supabase.functions.invoke("create-legacy-payment", {
        body: { userType: isCustomer ? "customer" : "business" }
      });

      if (error) {
        pageLogger.error("❌ Legacy payment error:", error);
        toast({
          title: "Payment Error",
          description: error.message || "Failed to create payment session. Please try again.",
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }

      if (data?.url) {
        pageLogger.debug("🚀 Legacy - Opening Stripe checkout:", data.url);
        
        const creditValue = creditBalance * 3;
        const discountMessage = creditBalance > 0 
          ? ` Your ${creditBalance} credit${creditBalance === 1 ? '' : 's'} ($${creditValue}) have been applied as a discount.`
          : '';
        
        // Use device-appropriate checkout method
        if (isMobile) {
          window.location.href = data.url;
          toast({
            title: "Redirecting to Checkout",
            description: `Redirecting to Stripe checkout. Complete your payment and you'll be returned to this page.${discountMessage}`,
          });
        } else {
          const newWindow = window.open(data.url, '_blank');
          
          if (newWindow) {
            toast({
              title: "Checkout Opened",
              description: `Stripe checkout has opened in a new tab. Complete your payment there and return to this page.${discountMessage}`,
            });
          } else {
            toast({
              title: "Popup Blocked",
              description: "Please allow popups for this site and try again, or copy this URL to complete your payment: " + data.url,
              variant: "destructive"
            });
          }
        }
        
        // Reset processing state since user will complete checkout in new tab
        setIsProcessing(false);
      } else {
        pageLogger.error("❌ No checkout URL returned:", data);
        toast({
          title: "Payment Error",
          description: "Failed to create payment session. Please try again.",
          variant: "destructive"
        });
        setIsProcessing(false);
      }
    } catch (error) {
      pageLogger.error("❌ Legacy subscription error:", error);
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
              creditBalance={creditBalance}
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
