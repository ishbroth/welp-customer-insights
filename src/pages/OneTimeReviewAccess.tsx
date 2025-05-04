
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
  const reviewId = searchParams.get("reviewId");
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!reviewId) {
      navigate("/search");
    }
  }, [reviewId, navigate]);

  const handlePayment = () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      
      // Simulate successful payment
      toast({
        title: "Payment Successful",
        description: "You now have access to the full review.",
      });
      
      // In a real app, we would store this information in the database
      localStorage.setItem(`review_access_${reviewId}`, "true");
      
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
                    Unlock Full Review
                  </div>
                </CardTitle>
                <CardDescription>
                  Access the complete review content with a one-time payment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="font-medium mb-2">One-time access includes:</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        Full review details and comments
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        Incidents and specific issues reported
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        Recommendations from other businesses
                      </li>
                    </ul>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 border-t border-b">
                    <span className="text-lg font-medium">Total</span>
                    <span className="text-2xl font-bold">$3.00</span>
                  </div>
                  
                  <div className="space-y-4">
                    <Button 
                      className="w-full welp-button"
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
