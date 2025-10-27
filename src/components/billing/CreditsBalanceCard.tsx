
import { RefreshCw, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCredits } from "@/hooks/useCredits";
import { useBillingData } from "@/hooks/useBillingData";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useStripeCheckout } from "@/utils/stripeCheckout";
import { logger } from "@/utils/logger";

const CreditsBalanceCard = () => {
  const componentLogger = logger.withContext('CreditsBalanceCard');
  const { balance, isLoading, loadCreditsData, processSuccessfulPurchase } = useCredits();
  const { currentUser } = useAuth();
  const { subscriptionData } = useBillingData(currentUser);
  const [searchParams, setSearchParams] = useSearchParams();
  const { openCheckout } = useStripeCheckout();
  const navigate = useNavigate();
  

  const isSubscribed = subscriptionData?.subscribed || false;

  // Handle successful credit purchase from URL parameters
  useEffect(() => {
    const handleCreditPurchaseSuccess = async () => {
      const success = searchParams.get("success");
      const credits = searchParams.get("credits");
      const sessionId = searchParams.get("session_id");

      if (success === "true" && credits === "true" && sessionId) {
        componentLogger.info("Processing successful credit purchase", { sessionId });

        try {
          // Process the successful purchase
          const { data, error } = await supabase.functions.invoke('process-credit-purchase', {
            body: { sessionId }
          });

          if (error) {
            componentLogger.error("Error processing credit purchase:", error);
            toast.error("Failed to process credit purchase");
          } else {
            componentLogger.info("Credit purchase processed successfully:", data);
            toast.success(data.message || "Credits purchased successfully!");
            await loadCreditsData(); // Refresh credits data
          }
        } catch (error) {
          componentLogger.error("Error processing credit purchase:", error);
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


  const handleBuyCredits = () => {
    componentLogger.info("Buy Credits button clicked!");

    if (isSubscribed) {
      componentLogger.debug("User is subscribed, not allowing credit purchase");
      return; // Don't navigate if subscribed
    }

    if (!currentUser) {
      componentLogger.warn("No current user");
      toast.error("Please log in to purchase credits");
      return;
    }

    // Navigate to buy credits page for both iOS and web
    // This provides better UX with quantity selection and handles IAP on iOS
    navigate('/buy-credits');
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
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-primary">
                  {isSubscribed ? "∞" : (balance || 0)}
                </p>
                <p className="text-sm text-gray-500">
                  {isSubscribed ? "Unlimited access" : "Available credits"}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={loadCreditsData}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            
            {!isSubscribed && (
              <Button 
                onClick={handleBuyCredits}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Buy Credits ($3 each)
              </Button>
            )}
            
            {isSubscribed && (
              <div className="text-sm text-green-600">
                ✓ Premium subscription active - unlimited access included
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CreditsBalanceCard;
