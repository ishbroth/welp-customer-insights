
import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Check, X } from "lucide-react";

const Subscription = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      toast({
        title: "Subscription Active",
        description: "Thank you for subscribing! You now have full access to Welp.",
      });
      setIsProcessing(false);
      
      // In a real app, redirect to dashboard after subscription
      setTimeout(() => {
        window.location.href = "/business-dashboard?subscribed=true";
      }, 2000);
    }, 2000);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-3">Welp. Subscription</h1>
            <p className="text-center text-xl mb-10 text-gray-600">
              Access the full customer database and make informed business decisions
            </p>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Free Plan */}
              <Card className="p-6 border-2">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold">Basic</h2>
                  <div className="text-3xl font-bold mt-4">Free</div>
                  <div className="text-sm text-gray-500">Limited Features</div>
                </div>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>Write and publish customer reviews</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>Basic search functionality</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>View customer star ratings</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>Pay fees to access full reviews</span>
                  </li>
                  <li className="flex items-start">
                    <X className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                    <span className="text-gray-500">Unlimited access to full review content</span>
                  </li>
                </ul>
                
                <div className="text-center">
                  <Link to="/signup?type=business">
                    <Button variant="outline" className="w-full border-welp-primary text-welp-primary hover:bg-welp-primary hover:text-white">
                      Current Plan
                    </Button>
                  </Link>
                </div>
              </Card>
              
              {/* Premium Plan */}
              <Card className="p-6 border-2 border-welp-primary relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-welp-primary text-white px-4 py-1 rounded-full text-sm font-bold">
                  RECOMMENDED
                </div>
                
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold">Premium</h2>
                  <div className="text-3xl font-bold mt-4">$19.95<span className="text-base font-normal">/month</span></div>
                  <div className="text-sm text-gray-500">Full Access</div>
                </div>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>Full access to all customer reviews</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>Advanced search functionality with filters</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>Customer history and insights</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>Priority customer support</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>Respond to your customer's responses</span>
                  </li>
                </ul>
                
                <Button 
                  onClick={handleSubscribe}
                  className="welp-button w-full"
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : "Subscribe Now"}
                </Button>
              </Card>
            </div>
            
            {/* FAQ Section */}
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">How does the subscription work?</h3>
                  <p className="text-gray-600">
                    Your subscription gives you full access to the Welp. customer database, including detailed reviews 
                    and ratings from other businesses. Subscriptions are billed monthly and can be canceled at any time.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Can I cancel my subscription?</h3>
                  <p className="text-gray-600">
                    Yes, you can cancel your subscription at any time from your account settings. 
                    You'll continue to have premium access until the end of your current billing period.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">What payment methods do you accept?</h3>
                  <p className="text-gray-600">
                    We accept all major credit cards, debit cards, Apple Pay, and Google Pay for subscription payments.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Is my information secure?</h3>
                  <p className="text-gray-600">
                    Yes, we use industry-standard encryption and security practices to protect your payment 
                    and personal information. We never store your full credit card details on our servers.
                  </p>
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

export default Subscription;
