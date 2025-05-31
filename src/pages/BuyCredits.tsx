
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, DollarSign, Lock, Plus, Minus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useCredits } from "@/hooks/useCredits";

const BuyCredits = () => {
  const [creditAmount, setCreditAmount] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { balance } = useCredits();

  const totalCost = creditAmount * 300; // $3 per credit in cents

  const handlePurchase = async () => {
    if (!currentUser) {
      toast.error("Please log in to purchase credits");
      navigate("/login");
      return;
    }

    if (creditAmount < 1) {
      toast.error("Please select at least 1 credit");
      return;
    }

    try {
      setIsLoading(true);
      console.log("Starting credit purchase process...");
      
      const { data, error } = await supabase.functions.invoke('create-credit-payment', {
        body: { creditAmount, totalCost }
      });

      if (error) {
        console.error("Error creating payment session:", error);
        toast.error("Failed to create payment session. Please try again.");
        return;
      }

      if (data?.url) {
        console.log("Redirecting to Stripe checkout...");
        window.open(data.url, '_blank');
      } else {
        console.error("No checkout URL received");
        toast.error("Failed to create payment session. Please try again.");
      }
    } catch (error) {
      console.error("Error in handlePurchase:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <Lock className="h-12 w-12 mx-auto mb-4 text-[#ea384c]" />
              <CardTitle>Login Required</CardTitle>
              <CardDescription>
                You must be logged in to purchase credits.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate("/login")} 
                className="w-full"
              >
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <CreditCard className="h-8 w-8 text-[#ea384c] mr-3" />
              <h1 className="text-3xl font-bold">Buy Credits</h1>
            </div>
            <p className="text-gray-600">
              Purchase credits to access full review content and respond to feedback
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Credit Purchase Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Purchase Credits
                </CardTitle>
                <CardDescription>
                  Each credit costs $3 and gives you access to one full review
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="credits">Number of Credits</Label>
                  <div className="flex items-center space-x-3 mt-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCreditAmount(Math.max(1, creditAmount - 1))}
                      disabled={creditAmount <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      id="credits"
                      type="number"
                      value={creditAmount}
                      onChange={(e) => setCreditAmount(Math.max(1, parseInt(e.target.value) || 1))}
                      min="1"
                      className="text-center w-24"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCreditAmount(creditAmount + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span>Credits:</span>
                    <span className="font-semibold">{creditAmount}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span>Price per credit:</span>
                    <span className="font-semibold">$3.00</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total:</span>
                      <span>${(totalCost / 100).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handlePurchase}
                  disabled={isLoading}
                  className="w-full bg-[#ea384c] hover:bg-[#d63384] text-white"
                >
                  {isLoading ? "Processing..." : `Purchase ${creditAmount} Credit${creditAmount > 1 ? 's' : ''}`}
                </Button>

                <p className="text-sm text-gray-500 text-center">
                  Secure payment processing through Stripe
                </p>
              </CardContent>
            </Card>

            {/* What You Can Do Card */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Current Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#ea384c]">
                    {balance} Credit{balance !== 1 ? 's' : ''}
                  </div>
                  <p className="text-gray-600 mt-2">
                    Available to use for accessing full reviews
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>What You Can Do With Credits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start space-x-3">
                    <div className="bg-[#ea384c] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <div>
                      <p className="font-semibold">Access full review and information, and respond to any feedback.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Why Use Credits?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-[#ea384c] rounded-full mt-2"></div>
                    <p className="text-sm">Pay only for what you need</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-[#ea384c] rounded-full mt-2"></div>
                    <p className="text-sm">No monthly commitments</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-[#ea384c] rounded-full mt-2"></div>
                    <p className="text-sm">Credits never expire</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BuyCredits;
