
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Lock } from "lucide-react";

const OneTimeReviewAccess = () => {
  const [searchParams] = useSearchParams();
  const customerId = searchParams.get("customerId");
  const reviewId = searchParams.get("reviewId");
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!customerId) {
      navigate("/search");
    }
  }, [customerId, navigate]);

  const handleSubscription = () => {
    navigate("/subscription");
  };

  const handlePayment = () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      
      // Simulate successful payment
      toast({
        title: "Payment Successful",
        description: reviewId 
          ? "You now have access to this review and can respond once."
          : "You now have access to all reviews for this customer.",
      });
      
      // In a real app, we would store this information in the database
      if (reviewId) {
        localStorage.setItem(`review_access_${reviewId}`, "true");
      } else {
        localStorage.setItem(`customer_access_${customerId}`, "true");
      }
      
      // Navigate back to search results
      navigate(-1);
    }, 2000);
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
                    </ul>
                    <Button 
                      className="w-full welp-button"
                      onClick={handleSubscription}
                    >
                      Subscribe for $9.95/month
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
                        onClick={() => navigate("/subscription")}
                      >
                        monthly subscription
                      </Button>
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
