
import { useState } from "react";
import { useAuth } from "@/contexts/auth";
import { Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfileSidebar from "@/components/ProfileSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Plus, Minus } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

const BuyCredits = () => {
  const { currentUser, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [creditAmount, setCreditAmount] = useState(10);
  const [isProcessing, setIsProcessing] = useState(false);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const totalCost = creditAmount * 3; // $3 per credit

  const handleCreditChange = (value: string) => {
    const num = parseInt(value);
    if (!isNaN(num) && num > 0) {
      setCreditAmount(num);
    }
  };

  const adjustCredits = (adjustment: number) => {
    const newAmount = creditAmount + adjustment;
    if (newAmount > 0) {
      setCreditAmount(newAmount);
    }
  };

  const handlePurchase = async () => {
    if (creditAmount <= 0) {
      toast.error("Please enter a valid number of credits");
      return;
    }

    try {
      setIsProcessing(true);
      console.log("Creating credit purchase session...");

      const { data, error } = await supabase.functions.invoke("create-credit-payment", {
        body: {
          creditAmount,
          totalCost: totalCost * 100 // Convert to cents
        }
      });

      if (error) {
        console.error("Error creating payment session:", error);
        toast.error("Failed to create payment session. Please try again.");
        return;
      }

      if (data?.url) {
        console.log("Redirecting to Stripe checkout:", data.url);
        window.open(data.url, '_blank');
      } else {
        toast.error("No checkout URL received");
      }
    } catch (error) {
      console.error("Error in handlePurchase:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow flex flex-col md:flex-row">
        <ProfileSidebar isOpen={sidebarOpen} toggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 p-6">
          <div className="container mx-auto max-w-2xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Buy Credits</h1>
              <p className="text-gray-600">
                Purchase credits to access premium features. Each credit costs $3 and can be used for accessing customer reviews or other premium services.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Purchase Credits
                </CardTitle>
                <CardDescription>
                  Credits never expire and can be used anytime to unlock premium content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Number of Credits</label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => adjustCredits(-1)}
                      disabled={creditAmount <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value={creditAmount}
                      onChange={(e) => handleCreditChange(e.target.value)}
                      min="1"
                      className="text-center max-w-24"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => adjustCredits(1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Credits:</span>
                    <span className="font-medium">{creditAmount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Price per credit:</span>
                    <span className="font-medium">$3.00</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between items-center font-bold">
                    <span>Total:</span>
                    <span className="text-lg">${totalCost.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">What you can do with credits:</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">1 credit</Badge>
                      Access a customer's complete review history
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">1 credit</Badge>
                      View and respond to individual reviews
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">1 credit</Badge>
                      Access premium customer profile details
                    </li>
                  </ul>
                </div>

                <Button
                  onClick={handlePurchase}
                  disabled={isProcessing || creditAmount <= 0}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing ? (
                    "Processing..."
                  ) : (
                    `Purchase ${creditAmount} Credits for $${totalCost.toFixed(2)}`
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default BuyCredits;
