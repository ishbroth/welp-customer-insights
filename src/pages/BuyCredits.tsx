
import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, DollarSign, Lock, Plus, Minus, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useCredits } from "@/hooks/useCredits";
import { useBillingData } from "@/hooks/useBillingData";
import { useStripeCheckout } from "@/utils/stripeCheckout";
import { logger } from '@/utils/logger';

const BuyCredits = () => {
  const pageLogger = logger.withContext('BuyCredits');
  const [creditAmount, setCreditAmount] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { balance, loadCreditsData } = useCredits();
  const { subscriptionData } = useBillingData(currentUser);
  const { openCheckout } = useStripeCheckout();

  const totalCost = creditAmount * 300; // $3 per credit in cents
  const isSubscribed = subscriptionData?.subscribed || false;

  // Handle successful credit purchase from URL parameters
  useEffect(() => {
    const handleCreditPurchaseSuccess = async () => {
      const success = searchParams.get("success");
      const credits = searchParams.get("credits");
      const sessionId = searchParams.get("session_id");

      if (success === "true" && credits === "true" && sessionId) {
        pageLogger.debug("Processing successful credit purchase", { sessionId });

        try {
          // Process the successful purchase
          const { data, error } = await supabase.functions.invoke('process-credit-purchase', {
            body: { sessionId }
          });

          if (error) {
            pageLogger.error("Error processing credit purchase:", error);
            toast.error("Failed to process credit purchase");
          } else {
            pageLogger.debug("Credit purchase processed successfully:", data);
            toast.success(data.message || "Credits purchased successfully!");
            await loadCreditsData(); // Refresh credits data
          }
        } catch (error) {
          pageLogger.error("Error processing credit purchase:", error);
          toast.error("Failed to process credit purchase");
        }

        // Clean up URL parameters
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete("success");
        newSearchParams.delete("credits");
        newSearchParams.delete("session_id");
        setSearchParams(newSearchParams);
      }
    };

    handleCreditPurchaseSuccess();
  }, [searchParams, setSearchParams, loadCreditsData]);

  // Check if user is authenticated, if not redirect to login
  useEffect(() => {
    if (!loading && !currentUser) {
      // Store the current path so we can redirect back after login
      navigate("/login", { 
        state: { 
          returnTo: "/buy-credits",
          message: "Please log in to purchase credits"
        }
      });
    }
  }, [currentUser, loading, navigate]);

  const handlePurchase = async () => {
    pageLogger.debug("🔥 Purchase button clicked!");

    if (!currentUser) {
      pageLogger.debug("❌ No current user");
      toast.error("Please log in to purchase credits");
      navigate("/login", {
        state: {
          returnTo: "/buy-credits",
          message: "Please log in to purchase credits"
        }
      });
      return;
    }

    if (isSubscribed) {
      pageLogger.debug("❌ User already subscribed");
      toast.error("You already have unlimited access with your subscription");
      return;
    }

    if (creditAmount < 1) {
      pageLogger.debug("❌ Invalid credit amount:", creditAmount);
      toast.error("Please select at least 1 credit");
      return;
    }

    setIsLoading(true);

    // Use Stripe for all platforms
    try {
      pageLogger.debug("📞 About to call create-credit-payment function...");
      pageLogger.debug("Request parameters:", { creditAmount, totalCost });

      const { data, error } = await supabase.functions.invoke('create-credit-payment', {
        body: { creditAmount, totalCost }
      });

      pageLogger.debug("🔍 Function response:", { data, error });

      if (error) {
        pageLogger.error("❌ Error from create-credit-payment:", error);
        toast.error("Failed to create payment session. Please try again.");
        return;
      }

      if (data?.url) {
        pageLogger.debug("🚀 Opening Stripe checkout URL:", data.url);
        openCheckout(data.url);

        toast.success("Redirecting to Stripe checkout...");
      } else {
        pageLogger.error("❌ No checkout URL received from function");
        pageLogger.error("Full response data:", data);
        toast.error("Failed to create payment session. Please try again.");
      }
    } catch (error) {
      pageLogger.error("❌ Unexpected error in handlePurchase:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while auth is being determined
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ea384c] mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // If not authenticated, component will redirect via useEffect
  if (!currentUser) {
    return null;
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

          {isSubscribed && (
            <Card className="mb-8 border-green-500 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center text-green-700">
                  <CheckCircle className="h-6 w-6 mr-2" />
                  <div className="text-center">
                    <h3 className="text-lg font-semibold">You're All Set!</h3>
                    <p>You have unlimited access with your {subscriptionData?.subscription_tier || 'Premium'} subscription.</p>
                    <p className="text-sm mt-1">No need to purchase credits!</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            {/* Credit Purchase Card */}
            <Card className={isSubscribed ? "opacity-50" : ""}>
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
                      disabled={creditAmount <= 1 || isSubscribed}
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
                      disabled={isSubscribed}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCreditAmount(creditAmount + 1)}
                      disabled={isSubscribed}
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
                  disabled={isLoading || isSubscribed}
                  className="w-full bg-[#ea384c] hover:bg-[#d63384] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubscribed 
                    ? "Already Subscribed - No Credits Needed" 
                    : isLoading 
                      ? "Processing..." 
                      : `Purchase ${creditAmount} Credit${creditAmount > 1 ? 's' : ''}`
                  }
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
                    {isSubscribed ? "∞" : `${balance} Credit${balance !== 1 ? 's' : ''}`}
                  </div>
                  <p className="text-gray-600 mt-2">
                    {isSubscribed 
                      ? "Unlimited access with your subscription" 
                      : "Available to use for accessing full reviews"
                    }
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
