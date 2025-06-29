
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Lock, User, Building2 } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";

const OneTimeReviewAccess = () => {
  const [searchParams] = useSearchParams();
  const reviewId = searchParams.get("reviewId");
  const success = searchParams.get("success");  
  const canceled = searchParams.get("canceled");
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    console.log("OneTimeReviewAccess: Component mounted", { reviewId, success, canceled });
    
    if (!reviewId) {
      navigate("/search");
      return;
    }
    
    // Handle success payment return from Stripe
    if (success === "true") {
      toast({
        title: "Payment Successful",
        description: "You now have access to this review and can respond once.",
      });
      navigate(-1);
    }
    
    // Handle canceled payment
    if (canceled) {
      toast({
        title: "Payment Canceled", 
        description: "Your payment was canceled. You can try again when you're ready.",
        variant: "destructive"
      });
    }
  }, [success, canceled, reviewId, navigate, toast]);

  const handleLogin = () => {
    navigate("/login");
  };

  const handleSignup = (type: 'business' | 'customer') => {
    navigate(`/signup?type=${type}`);
  };

  const handleSubscription = () => {
    if (!currentUser) {
      toast({
        title: "Account Required",
        description: "You need to create an account to subscribe.",
        variant: "destructive"
      });
      return;
    }
    navigate("/subscription");
  };

  const handleGuestPayment = async () => {
    console.log("OneTimeReviewAccess: Starting guest payment for reviewId:", reviewId);
    setIsProcessing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: {
          reviewId,
          amount: 300,
          isGuest: true
        }
      });
      
      if (error) {
        console.error("OneTimeReviewAccess: Guest payment error:", error);
        throw new Error(error.message);
      }
      
      if (!data?.url) {
        throw new Error("No checkout URL returned");
      }
      
      console.log("OneTimeReviewAccess: Redirecting to Stripe checkout:", data.url);
      window.location.href = data.url;
      
    } catch (error) {
      console.error("OneTimeReviewAccess: Payment error:", error);
      toast({
        title: "Payment Error",
        description: "An error occurred while processing your payment. Please try again.",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };

  const handleAuthenticatedPayment = async () => {
    if (!currentUser) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to make this purchase.",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: {
          reviewId,
          amount: 300
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!data?.url) {
        throw new Error("No checkout URL returned");
      }
      
      window.location.href = data.url;
      
    } catch (error) {
      console.error("OneTimeReviewAccess: Authenticated payment error:", error);
      toast({
        title: "Payment Error",
        description: "An error occurred while processing your payment. Please try again.",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };

  if (!reviewId) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">No Review Selected</h1>
            <p className="text-gray-600 mb-6">Please select a review to access.</p>
            <Button onClick={() => navigate("/search")} className="bg-blue-600 hover:bg-blue-700 text-white">
              Go to Search
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="shadow-lg border-0">
            <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="text-3xl font-bold flex items-center justify-center">
                <Lock className="w-8 h-8 mr-3" />
                Unlock Review Access
              </CardTitle>
              <CardDescription className="text-blue-100 text-lg">
                Get instant access to respond to this review
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-8">
              <div className="space-y-8">
                {/* Guest Payment Option - Always show for non-logged users */}
                {!currentUser && (
                  <div className="relative">
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                      🚀 QUICK ACCESS
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-xl border-2 border-green-200">
                      <h3 className="font-bold text-xl mb-4 text-green-800">Pay $3 - No Account Needed</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="space-y-3">
                          <div className="flex items-center text-green-700">
                            <span className="text-green-500 mr-3 text-lg">✓</span>
                            <span>Instant access to this review</span>
                          </div>
                          <div className="flex items-center text-green-700">
                            <span className="text-green-500 mr-3 text-lg">✓</span>
                            <span>Respond once to this review</span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center text-green-700">
                            <span className="text-green-500 mr-3 text-lg">✓</span>
                            <span>No registration required</span>
                          </div>
                          <div className="flex items-center text-green-700">
                            <span className="text-green-500 mr-3 text-lg">✓</span>
                            <span>Secure payment via Stripe</span>
                          </div>
                        </div>
                      </div>
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-4 font-bold rounded-lg shadow-lg"
                        disabled={isProcessing}
                        onClick={handleGuestPayment}
                      >
                        {isProcessing ? "Processing..." : "Pay $3.00 - Get Instant Access"}
                      </Button>
                    </div>
                  </div>
                )}

                {/* For logged-in users - show subscription option */}
                {currentUser && (
                  <div className="relative">
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                      ⭐ RECOMMENDED
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl border-2 border-blue-200">
                      <h3 className="font-bold text-xl mb-4 text-blue-800">Unlimited Access Subscription</h3>
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center text-blue-700">
                          <span className="text-blue-500 mr-3 text-lg">✓</span>
                          <span>Access to ALL reviews about your business</span>
                        </div>
                        <div className="flex items-center text-blue-700">
                          <span className="text-blue-500 mr-3 text-lg">✓</span>
                          <span>Unlimited responses to all reviews</span>
                        </div>
                        <div className="flex items-center text-blue-700">
                          <span className="text-blue-500 mr-3 text-lg">✓</span>
                          <span>Priority customer support</span>
                        </div>
                      </div>
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-4 font-bold rounded-lg shadow-lg"
                        onClick={handleSubscription}
                      >
                        Subscribe for $11.99/month
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* One-time access for logged-in users */}
                {currentUser && (
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-semibold text-lg mb-4 text-gray-800">Or pay once for this review:</h3>
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg mb-4">
                      <span className="text-lg font-medium text-gray-700">One-time access</span>
                      <span className="text-2xl font-bold text-gray-900">$3.00</span>
                    </div>
                    <Button 
                      className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg"
                      disabled={isProcessing}
                      onClick={handleAuthenticatedPayment}
                    >
                      {isProcessing ? "Processing..." : "Pay $3.00"}
                    </Button>
                  </div>
                )}

                {/* Account creation options for non-logged users */}
                {!currentUser && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="flex items-center mb-4">
                        <div className="flex-1 border-t border-gray-300"></div>
                        <span className="px-4 text-gray-500 text-sm font-medium">Want more features?</span>
                        <div className="flex-1 border-t border-gray-300"></div>
                      </div>
                      <p className="text-gray-600 mb-6">
                        Create an account for subscriptions, unlimited access, and more features
                      </p>
                    </div>
                    
                    <Button 
                      className="w-full bg-gray-800 hover:bg-gray-900 text-white py-3 rounded-lg"
                      onClick={handleLogin}
                    >
                      Log In to Existing Account
                    </Button>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Button 
                        variant="outline"
                        onClick={() => handleSignup('business')}
                        className="flex items-center justify-center py-3 border-2 hover:bg-gray-50"
                      >
                        <Building2 className="w-5 h-5 mr-2" />
                        Business Owner
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => handleSignup('customer')}
                        className="flex items-center justify-center py-3 border-2 hover:bg-gray-50"
                      >
                        <User className="w-5 h-5 mr-2" />
                        Customer
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="text-center pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 flex items-center justify-center">
                    <Lock className="w-4 h-4 mr-2" />
                    Payments secured by Stripe
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OneTimeReviewAccess;
