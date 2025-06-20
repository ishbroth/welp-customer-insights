
import { RefreshCw, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCredits } from "@/hooks/useCredits";
import { useBillingData } from "@/hooks/useBillingData";
import { useAuth } from "@/contexts/auth";

const CreditsBalanceCard = () => {
  const { balance, isLoading, loadCreditsData } = useCredits();
  const { currentUser } = useAuth();
  const { subscriptionData } = useBillingData(currentUser);

  const isSubscribed = subscriptionData?.subscribed || false;

  const handleBuyCredits = () => {
    if (isSubscribed) return; // Don't navigate if subscribed
    window.location.href = '/buy-credits';
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
                  Buy Credits
                </Button>
              </div>
            </div>
            {isSubscribed && (
              <div className="mt-2 text-sm text-green-600">
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
