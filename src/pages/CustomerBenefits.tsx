
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Trophy, Star, Badge, CheckCircle2, X, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CustomerBenefits = () => {
  const navigate = useNavigate();
  
  const handleNavigateToSignup = () => {
    navigate('/signup?type=customer');
  };

  const handleSubscribe = () => {
    navigate('/subscription');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-8 text-center text-welp-primary">Customer Subscription Benefits</h1>
            
            <div className="text-center mb-12">
              <p className="text-xl text-gray-700">
                Take control of your reputation and enjoy exclusive benefits with a Welp customer subscription.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <Card className="p-6 hover:shadow-lg transition-shadow bg-gradient-to-b from-white to-welp-bg-light">
                <div className="flex justify-center mb-4">
                  <div className="bg-welp-primary/10 p-3 rounded-full">
                    <Star className="h-10 w-10 text-welp-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-center mb-3">Reputation Management</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-welp-primary mr-2">•</span>
                    <span>Receive instant alerts when businesses review you</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-welp-primary mr-2">•</span>
                    <span>Respond to reviews and provide additional context</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-welp-primary mr-2">•</span>
                    <span>Request review revisions if information is incorrect</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-welp-primary mr-2">•</span>
                    <span>Track your reputation score changes over time</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow bg-gradient-to-b from-white to-welp-bg-light">
                <div className="flex justify-center mb-4">
                  <div className="bg-welp-primary/10 p-3 rounded-full">
                    <Badge className="h-10 w-10 text-welp-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-center mb-3">Verified Customer Badge</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-welp-primary mr-2">•</span>
                    <span>Stand out with a verified customer badge on your profile</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-welp-primary mr-2">•</span>
                    <span>Build trust with businesses before your first interaction</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-welp-primary mr-2">•</span>
                    <span>Access to exclusive business offers for verified customers</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-welp-primary mr-2">•</span>
                    <span>Establish credibility in dispute resolution processes</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow bg-gradient-to-b from-white to-welp-bg-light">
                <div className="flex justify-center mb-4">
                  <div className="bg-welp-primary/10 p-3 rounded-full">
                    <Trophy className="h-10 w-10 text-welp-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-center mb-3">Premium Features</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-welp-primary mr-2">•</span>
                    <span>Enhanced profile customization options</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-welp-primary mr-2">•</span>
                    <span>Priority customer support for account issues</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-welp-primary mr-2">•</span>
                    <span>Advanced analytics on your reputation metrics</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-welp-primary mr-2">•</span>
                    <span>Early access to new Welp features and tools</span>
                  </li>
                </ul>
              </Card>
            </div>

            <Card className="mt-12 p-8 border-welp-primary/20 bg-welp-bg-light">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="md:w-2/3 mb-6 md:mb-0">
                  <h3 className="text-2xl font-bold mb-3 text-welp-primary">Ready to take control of your reputation?</h3>
                  <p className="text-gray-600">
                    Join thousands of customers who are actively managing their business reputation and building trust with service providers.
                  </p>
                </div>
                <Button 
                  onClick={handleNavigateToSignup}
                  className="bg-welp-primary hover:bg-welp-tertiary text-white px-8 py-3 rounded-lg"
                >
                  Subscribe Now
                </Button>
              </div>
            </Card>

            <div className="mt-16">
              <h2 className="text-2xl font-semibold mb-10 text-center">Subscription Pricing</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Free Plan */}
                <Card className="p-6 border-2">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold">Basic</h3>
                    <div className="text-3xl font-bold mt-4">Free</div>
                    <div className="text-sm text-gray-500">Limited Features</div>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>View basic information about your reviews</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Pay one-time fees to access specific reviews</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>One response per paid review</span>
                    </li>
                    <li className="flex items-start">
                      <X className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                      <span className="text-gray-500">Unlimited access to reviews</span>
                    </li>
                    <li className="flex items-start">
                      <X className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                      <span className="text-gray-500">Unlimited responses to businesses</span>
                    </li>
                  </ul>
                  
                  <Button variant="outline" className="w-full border-welp-primary text-welp-primary hover:bg-welp-primary hover:text-white">
                    Current Plan
                  </Button>
                </Card>
                
                {/* Premium Plan */}
                <Card className="p-6 border-2 border-welp-primary relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-welp-primary text-white px-4 py-1 rounded-full text-sm font-bold">
                    RECOMMENDED
                  </div>
                  
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold">Premium</h3>
                    <div className="text-3xl font-bold mt-4">$9.95<span className="text-base font-normal">/month</span></div>
                    <div className="text-sm text-gray-500">Full Access</div>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Full access to all reviews about you</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Unlimited responses to business reviews</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Ongoing conversation with businesses</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>No additional fees per review</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Priority customer support</span>
                    </li>
                  </ul>
                  
                  <Button 
                    onClick={handleSubscribe}
                    className="w-full bg-welp-primary hover:bg-welp-tertiary text-white"
                  >
                    Subscribe Now
                  </Button>
                </Card>
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
