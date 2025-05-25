
import { RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
}

interface CurrentSubscriptionCardProps {
  isLoadingData: boolean;
  subscriptionData: SubscriptionData | null;
  hasStripeCustomer: boolean;
  isLoadingPortal: boolean;
  currentUserType?: string;
  onManageSubscription: () => void;
}

const CurrentSubscriptionCard = ({
  isLoadingData,
  subscriptionData,
  hasStripeCustomer,
  isLoadingPortal,
  currentUserType,
  onManageSubscription
}: CurrentSubscriptionCardProps) => {
  const navigate = useNavigate();

  const getSubscriptionPlanName = () => {
    if (!subscriptionData?.subscribed) return "No Active Subscription";
    
    const tier = subscriptionData.subscription_tier;
    if (currentUserType === "business") {
      return tier ? `Business ${tier} Plan` : "Business Plan";
    }
    return tier ? `Customer ${tier} Plan` : "Customer Plan";
  };

  const getNextBillingDate = () => {
    if (!subscriptionData?.subscription_end) return "N/A";
    return new Date(subscriptionData.subscription_end).toLocaleDateString();
  };

  const handleSubscribeNow = () => {
    navigate('/subscription?from=billing');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Subscription</CardTitle>
        <CardDescription>Details about your current subscription plan</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoadingData ? (
          <div className="flex items-center justify-center p-4">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Loading subscription data...
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-medium text-lg">
              {getSubscriptionPlanName()}
            </p>
            {subscriptionData?.subscribed ? (
              <>
                <p className="text-gray-600">
                  Active subscription
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Next billing date: {getNextBillingDate()}
                </p>
              </>
            ) : (
              <p className="text-gray-600">
                No active subscription
              </p>
            )}
            
            <div className="mt-4 flex items-center justify-end">
              {hasStripeCustomer && subscriptionData?.subscribed ? (
                <Button
                  variant="default"
                  onClick={onManageSubscription}
                  disabled={isLoadingPortal}
                >
                  {isLoadingPortal ? "Loading..." : "Manage Subscription"}
                </Button>
              ) : (
                <Button
                  variant="default"
                  onClick={handleSubscribeNow}
                >
                  Subscribe Now
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CurrentSubscriptionCard;
