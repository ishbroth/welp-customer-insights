
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
  const customerId = searchParams.get("customerId");
  const reviewId = searchParams.get("reviewId");
  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!customerId && !reviewId) {
      navigate("/search");
      return;
    }
    
    // Handle success payment return from Stripe
    if (success === "true") {
      toast({
        title: "Payment Successful",
        description: reviewId 
          ? "You now have access to this review and can respond once."
          : "You now have access to all reviews for this customer.",
      });
      // Navigate back to search results
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
  }, [success, canceled, customerId, reviewId, navigate, toast]);

  const handleLogin = () => {
    navigate("/login");
  };

  const handleSignup = (type: 'business' | 'customer') => {
    navigate(`/signup?type=${type}`);
  };

  const handleSubscription = () => {
    if (!currentUser) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to subscribe.",
        variant: "destructive"
      });
      return;
    }
    navigate("/subscription");
  };

  const handlePayment = async () => {
    if (!currentUser) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to make a purchase.",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Prepare the request payload with correct pricing
      const payload = {
        customerId,
        reviewId,
        amount: 300 // Always $3.00 for one-time access
      };
      
      // Call the create-payment edge function
      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: payload
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!data?.url) {
        throw new Error("No checkout URL returned");
      }
      
      // Redirect to Stripe checkout - this will automatically save payment methods for future use
      window.location.href = data.url;
      console.log("OneTimeReviewAccess - Redirecting to Stripe checkout");
      
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

  // If user is not logged in, show authentication prompt
  if (!currentUser) {
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
                      Authentication Required
                    </div>
                  </CardTitle>
                  <CardDescription>
                    Please log in or create an account to access this review content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-4">
                        You need to be logged in to purchase one-time access for <strong>$3.00</strong>
                      </p>
                    </div>
                    
                    <Button 
                      className="w-full welp-button"
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
                    
                    <div className="text-center pt-4">
                      <p className="text-xs text-gray-500">
                        Your payment information will be securely stored for future purchases
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
  }

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
                    {reviewId ? "Unlock Review Response" : "Unlock All Customer Reviews"}
                  </div>
                </CardTitle>
                <CardDescription>
                  {reviewId 
                    ? "Respond to business feedback with a one-time payment" 
                    : "Access all reviews for this customer with a one-time payment"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Subscription Option (Highlighted) */}
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
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        Secure payment information storage for quick renewals
                      </li>
                    </ul>
                    <Button 
                      className="w-full welp-button"
                      onClick={handleSubscription}
                    >
                      Subscribe for $11.99/month
                    </Button>
                  </div>
                  
                  {/* One-time Option */}
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="font-medium mb-2">One-time access includes:</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        {reviewId 
                          ? "Ability to respond once to business feedback" 
                          : "All reviews for this specific customer"}
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        Full review details and comments
                      </li>
                      {!reviewId && (
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          Incidents and specific issues reported by other businesses
                        </li>
                      )}
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span className="text-gray-600">
                          Payment information securely stored for future purchases
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-500 mr-2">✗</span>
                        <span className="text-gray-500">
                          You'll need to pay again to respond to any future business replies
                        </span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 border-t border-b">
                    <span className="text-lg font-medium">Total</span>
                    <span className="text-2xl font-bold">$3.00</span>
                  </div>
                  
                  <div className="space-y-4">
                    <Button 
                      className="w-full"
                      variant="outline"
                      disabled={isProcessing}
                      onClick={handlePayment}
                    >
                      {isProcessing ? "Processing..." : "Pay $3.00"}
                    </Button>
                    
                    <p className="text-sm text-gray-500 text-center">
                      Or get unlimited access to all reviews with our{" "}
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-welp-primary"
                        onClick={handleSubscription}
                      >
                        monthly subscription
                      </Button>
                    </p>
                    
                    <div className="text-center pt-2">
                      <p className="text-xs text-gray-400">
                        🔒 Payments secured by Stripe. Your payment information is safely stored for future purchases.
                      </p>
                    </div>
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
