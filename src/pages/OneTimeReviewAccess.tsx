
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
      // Navigate back to search results or show the unlocked review
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
    setIsProcessing(true);
    
    try {
      // Call the create-payment edge function for guest users
      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: {
          reviewId,
          amount: 300, // $3.00 for one-time access
          isGuest: true
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!data?.url) {
        throw new Error("No checkout URL returned");
      }
      
      // Redirect to Stripe checkout
      window.location.href = data.url;
      console.log("OneTimeReviewAccess - Guest payment: Redirecting to Stripe checkout");
      
    } catch (error) {
      console.error("Guest payment error:", error);
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
      console.log("OneTimeReviewAccess - Authenticated payment: Redirecting to Stripe checkout");
      
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Error",
        description: "An error occurred while processing your payment. Please try again.",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">
                  <div className="flex items-center">
                    <Lock className="w-6 h-6 mr-2 text-welp-primary" />
                    Unlock Review Response
                  </div>
                </CardTitle>
                <CardDescription>
                  Respond to business feedback with a one-time payment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Guest Payment Option - Highlighted for non-logged users */}
                  {!currentUser && (
                    <div className="p-4 bg-welp-primary/5 rounded-lg border border-welp-primary relative">
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-welp-primary text-white px-4 py-1 rounded-full text-xs font-bold">
                        QUICK ACCESS
                      </div>
                      <h3 className="font-medium mb-2 text-welp-primary">Pay $3 - No Account Required</h3>
                      <ul className="space-y-2 mb-4">
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          Respond once to this specific review
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          No registration needed
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          Secure payment via Stripe
                        </li>
                        <li className="flex items-start">
                          <span className="text-red-500 mr-2">✗</span>
                          <span className="text-gray-500">
                            One-time access only (create account for more features)
                          </span>
                        </li>
                      </ul>
                      <Button 
                        className="w-full welp-button"
                        disabled={isProcessing}
                        onClick={handleGuestPayment}
                      >
                        {isProcessing ? "Processing..." : "Pay $3 - No Account Needed"}
                      </Button>
                    </div>
                  )}

                  {/* For logged-in users - show account benefits */}
                  {currentUser && (
                    <div className="p-4 bg-welp-primary/5 rounded-lg border border-welp-primary relative">
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-welp-primary text-white px-4 py-1 rounded-full text-xs font-bold">
                        RECOMMENDED
                      </div>
                      <h3 className="font-medium mb-2 text-welp-primary">Get unlimited access with a subscription:</h3>
                      <ul className="space-y-2 mb-4">
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          Unlimited access to all reviews about you
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          Respond to all reviews without additional fees
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          Unlimited responses to business replies
                        </li>
                      </ul>
                      <Button 
                        className="w-full welp-button"
                        onClick={handleSubscription}
                      >
                        Subscribe for $11.99/month
                      </Button>
                    </div>
                  )}
                  
                  {/* One-time access for logged-in users */}
                  {currentUser && (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <h3 className="font-medium mb-2">Or pay once for this review:</h3>
                      <div className="flex justify-between items-center p-4 border-t border-b mb-4">
                        <span className="text-lg font-medium">One-time access</span>
                        <span className="text-2xl font-bold">$3.00</span>
                      </div>
                      <Button 
                        className="w-full"
                        variant="outline"
                        disabled={isProcessing}
                        onClick={handleAuthenticatedPayment}
                      >
                        {isProcessing ? "Processing..." : "Pay $3.00"}
                      </Button>
                    </div>
                  )}

                  {/* Account creation options for non-logged users */}
                  {!currentUser && (
                    <div className="space-y-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-4">
                          Want more features? Create an account for subscriptions and credits:
                        </p>
                      </div>
                      
                      <Button 
                        className="w-full"
                        variant="outline"
                        onClick={handleLogin}
                      >
                        Log In to Existing Account
                      </Button>
                      
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-white px-2 text-gray-500">Or create new account</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <Button 
                          variant="outline"
                          onClick={() => handleSignup('business')}
                          className="flex items-center justify-center"
                        >
                          <Building2 className="w-4 h-4 mr-2" />
                          Business Owner
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => handleSignup('customer')}
                          className="flex items-center justify-center"
                        >
                          <User className="w-4 h-4 mr-2" />
                          Customer
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <div className="text-center pt-2">
                    <p className="text-xs text-gray-400">
                      🔒 Payments secured by Stripe
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OneTimeReviewAccess;
