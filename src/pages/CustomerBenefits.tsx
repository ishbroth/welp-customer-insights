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
import { Button } from "@/components/ui/button";
import { Check, Star, Shield, Zap, Users, Clock } from "lucide-react";

const CustomerBenefits = () => {
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
        console.log("🚀 Legacy - Opening Stripe checkout in new tab:", data.url);
        
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
            <h1 className="text-4xl font-bold text-center mb-3">Customer Benefits</h1>
            <p className="text-center text-xl mb-10 text-gray-600">
              Unlock the full power of Welp as a customer. Get unlimited access to reviews, 
              respond to businesses, and take control of your online reputation.
            </p>

            {/* Benefits Overview */}
            <div className="mb-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Why Upgrade Your Account?</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Transform your customer experience with premium features designed to give you more control and better insights.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 bg-welp-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-8 w-8 text-welp-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Full Access</h3>
                  <p className="text-gray-600">Access all reviews about you without per-review fees</p>
                </div>

                <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 bg-welp-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-8 w-8 text-welp-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Unlimited Responses</h3>
                  <p className="text-gray-600">Respond to business reviews without limitations</p>
                </div>

                <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 bg-welp-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-welp-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Ongoing Conversations</h3>
                  <p className="text-gray-600">Maintain continuous dialogue with businesses</p>
                </div>

                <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 bg-welp-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-8 w-8 text-welp-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Priority Support</h3>
                  <p className="text-gray-600">Get faster response times and dedicated help</p>
                </div>
              </div>
            </div>
            
            <SubscriptionPlans 
              type="customer"
              isProcessing={isProcessing}
              handleSubscribe={handleSubscribeClick}
              handleLegacySubscribe={handleLegacySubscribeClick}
            />
            
            <SubscriptionFAQ isCustomer={true} />

            {/* Call to Action */}
            <div className="mt-16 py-16 bg-welp-primary text-white rounded-lg">
              <div className="container mx-auto px-6 text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to Upgrade?</h2>
                <p className="text-xl mb-8 max-w-2xl mx-auto">
                  Join thousands of customers who have taken control of their online reputation
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={handleSubscribeClick}
                    disabled={isProcessing}
                    className="bg-white text-welp-primary hover:bg-gray-100 font-semibold px-8 py-3"
                  >
                    {isProcessing ? "Processing..." : "Start Premium Today"}
                  </Button>
                  <Button 
                    onClick={handleLegacySubscribeClick}
                    disabled={isProcessing}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-8 py-3"
                  >
                    {isProcessing ? "Processing..." : "Get Lifetime Access"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CustomerBenefits;
