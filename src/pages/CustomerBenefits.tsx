
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { handleSubscription } from "@/services/subscriptionService";
import { supabase } from "@/integrations/supabase/client";
import { SubscriptionPlans } from "@/components/subscription/SubscriptionPlans";
import { Button } from "@/components/ui/button";
import { Check, Star, Shield, Zap, Users, Clock } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-welp-bg-light to-white">
      {/* Hero Section */}
      <div className="bg-welp-primary text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-6">Customer Benefits</h1>
          <p className="text-xl max-w-3xl mx-auto leading-relaxed">
            Unlock the full power of Welp as a customer. Get unlimited access to reviews, 
            respond to businesses, and take control of your online reputation.
          </p>
        </div>
      </div>

      {/* Benefits Overview */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-6">
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
      </div>

      {/* Subscription Plans */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Choose Your Plan</h2>
            <p className="text-lg text-gray-600">
              Select the perfect plan to unlock all customer benefits
            </p>
          </div>

          <SubscriptionPlans 
            type="customer"
            isProcessing={isProcessing}
            handleSubscribe={handleSubscribeClick}
            handleLegacySubscribe={handleLegacySubscribeClick}
          />
        </div>
      </div>

      {/* Feature Comparison */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">What You Get</h2>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Free Column */}
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-6 text-gray-600">Basic (Free)</h3>
                <ul className="space-y-4">
                  <li className="flex items-center justify-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-sm">Pay per review access</span>
                  </li>
                  <li className="flex items-center justify-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-sm">One response per review</span>
                  </li>
                  <li className="flex items-center justify-center text-gray-400">
                    <span className="text-sm">Limited features</span>
                  </li>
                </ul>
              </div>

              {/* Premium Column */}
              <div className="text-center border-2 border-welp-primary rounded-lg p-6 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-welp-primary text-white px-4 py-1 rounded-full text-sm font-bold">
                  RECOMMENDED
                </div>
                <h3 className="text-xl font-semibold mb-6 text-welp-primary">Premium</h3>
                <ul className="space-y-4">
                  <li className="flex items-center justify-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-sm">Unlimited review access</span>
                  </li>
                  <li className="flex items-center justify-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-sm">Unlimited responses</span>
                  </li>
                  <li className="flex items-center justify-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-sm">Priority support</span>
                  </li>
                  <li className="flex items-center justify-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-sm">Ongoing conversations</span>
                  </li>
                </ul>
              </div>

              {/* Legacy Column */}
              <div className="text-center border-2 border-yellow-500 rounded-lg p-6 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  LIFETIME
                </div>
                <h3 className="text-xl font-semibold mb-6 text-yellow-600">Legacy</h3>
                <ul className="space-y-4">
                  <li className="flex items-center justify-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-sm">Everything in Premium</span>
                  </li>
                  <li className="flex items-center justify-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-sm">Lifetime access</span>
                  </li>
                  <li className="flex items-center justify-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-sm">Future features included</span>
                  </li>
                  <li className="flex items-center justify-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-sm">VIP support</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-16 bg-welp-primary text-white">
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
  );
};

export default CustomerBenefits;
