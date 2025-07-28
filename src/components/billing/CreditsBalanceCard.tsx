
import { RefreshCw, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCredits } from "@/hooks/useCredits";
import { useBillingData } from "@/hooks/useBillingData";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const CreditsBalanceCard = () => {
  const { balance, isLoading, loadCreditsData, processSuccessfulPurchase } = useCredits();
  const { currentUser } = useAuth();
  const { subscriptionData } = useBillingData(currentUser);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isProcessingExisting, setIsProcessingExisting] = useState(false);

  const isSubscribed = subscriptionData?.subscribed || false;

  // Handle successful credit purchase from URL parameters
  useEffect(() => {
    const handleCreditPurchaseSuccess = async () => {
      const success = searchParams.get("success");
      const credits = searchParams.get("credits");
      const sessionId = searchParams.get("session_id");

      if (success === "true" && credits === "true" && sessionId) {
        console.log("Processing successful credit purchase", { sessionId });
        
        try {
          // Process the successful purchase
          const { data, error } = await supabase.functions.invoke('process-credit-purchase', {
            body: { sessionId }
          });

          if (error) {
            console.error("Error processing credit purchase:", error);
            toast.error("Failed to process credit purchase");
          } else {
            console.log("Credit purchase processed successfully:", data);
            toast.success(data.message || "Credits purchased successfully!");
            await loadCreditsData(); // Refresh credits data
          }
        } catch (error) {
          console.error("Error processing credit purchase:", error);
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

  const handleProcessExistingTransaction = async () => {
    if (!currentUser) {
      toast.error("Please log in to process transaction");
      return;
    }

    setIsProcessingExisting(true);
    try {
      console.log("Processing existing transaction for user:", currentUser.id);
      
      // Process the existing $3 charge (ch_3RpubKF1tU4YZkYC0wtGDtOr)
      const { data, error } = await supabase.functions.invoke('process-credit-purchase', {
        body: { chargeId: "ch_3RpubKF1tU4YZkYC0wtGDtOr" }
      });

      if (error) {
        console.error("Error processing existing transaction:", error);
        toast.error("Failed to process existing transaction");
      } else {
        console.log("Existing transaction processed successfully:", data);
        if (data.alreadyProcessed) {
          toast.info("This transaction has already been processed");
        } else {
          toast.success(data.message || "Credits applied successfully!");
        }
        await loadCreditsData(); // Refresh credits data
      }
    } catch (error) {
      console.error("Error processing existing transaction:", error);
      toast.error("Failed to process existing transaction");
    } finally {
      setIsProcessingExisting(false);
    }
  };

  const handleBuyCredits = async () => {
    console.log("🔥 Buy Credits button clicked!");
    
    if (isSubscribed) {
      console.log("❌ User is subscribed, not allowing credit purchase");
      return; // Don't navigate if subscribed
    }
    
    if (!currentUser) {
      console.log("❌ No current user");
      toast.error("Please log in to purchase credits");
      return;
    }

    try {
      console.log("📞 About to call create-credit-payment function...");
      const { data, error } = await supabase.functions.invoke('create-credit-payment', {
        body: {}
      });

      console.log("🔍 Function response:", { data, error });

      if (error) {
        console.error("❌ Error creating payment session:", error);
        toast.error("Failed to create payment session");
        return;
      }

      if (data?.url) {
        console.log("🚀 Opening Stripe checkout URL:", data.url);
        window.open(data.url, '_blank');
        
        toast.success("Stripe checkout opened in new tab!");
      } else {
        console.error("❌ No URL returned from payment session");
        console.error("Full response data:", data);
        toast.error("Failed to create payment session");
      }
    } catch (error) {
      console.error("❌ Error in handleBuyCredits:", error);
      toast.error("An error occurred while processing your request");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Credits Balance</CardTitle>
        <CardDescription>
          {isSubscribed 
            ? "You have unlimited access with your subscription" 
            : "Use credits to access premium customer profiles"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Loading credits...
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-primary">
                  {isSubscribed ? "∞" : (balance || 0)}
                </p>
                <p className="text-sm text-gray-500">
                  {isSubscribed ? "Unlimited access" : "Available credits"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadCreditsData}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
                <Button 
                  onClick={handleBuyCredits}
                  disabled={isSubscribed}
                  className={isSubscribed ? "opacity-50 cursor-not-allowed" : ""}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Buy Credits ($3 each)
                </Button>
              </div>
            </div>
            {isSubscribed && (
              <div className="mt-2 text-sm text-green-600">
                ✓ Premium subscription active - unlimited access included
              </div>
            )}
            {balance === 0 && !isSubscribed && (
              <div className="mt-3 border-t pt-3">
                <p className="text-sm text-orange-600 mb-2">
                  Need to process your previous $3 payment?
                </p>
                <Button 
                  onClick={handleProcessExistingTransaction}
                  disabled={isProcessingExisting}
                  variant="outline"
                  size="sm"
                >
                  {isProcessingExisting ? "Processing..." : "Apply Previous Payment"}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CreditsBalanceCard;
