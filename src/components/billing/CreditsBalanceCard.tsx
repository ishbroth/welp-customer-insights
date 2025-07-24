
import { RefreshCw, Plus, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCredits } from "@/hooks/useCredits";
import { useBillingData } from "@/hooks/useBillingData";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

const CreditsBalanceCard = () => {
  const { balance, isLoading, loadCreditsData } = useCredits();
  const { currentUser } = useAuth();
  const { subscriptionData } = useBillingData(currentUser);

  const isSubscribed = subscriptionData?.subscribed || false;

  const handleBuyCredits = async () => {
    if (isSubscribed) return; // Don't navigate if subscribed
    
    if (!currentUser) {
      toast.error("Please log in to purchase credits");
      return;
    }

    try {
      console.log("Creating credit payment session...");
      const { data, error } = await supabase.functions.invoke('create-credit-payment', {
        body: {} // Remove the specific credit amount and total cost parameters
      });

      if (error) {
        console.error("Error creating payment session:", error);
        toast.error("Failed to create payment session");
        return;
      }

      if (data?.url) {
        console.log("Opening Stripe checkout...");
        window.open(data.url, '_blank');
      } else {
        console.error("No URL returned from payment session");
        toast.error("Failed to create payment session");
      }
    } catch (error) {
      console.error("Error in handleBuyCredits:", error);
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
            {!isSubscribed && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">💡 Tip: Adjust quantity at checkout</p>
                    <p>On the Stripe checkout page, you can click the small "Qty" text to adjust how many credits you want to purchase (1-50 credits available).</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CreditsBalanceCard;
