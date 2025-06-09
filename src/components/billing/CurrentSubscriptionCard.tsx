
import { RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

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
  currentUserEmail?: string;
  onManageSubscription: () => void;
  onUnsubscribe: () => void;
}

const CurrentSubscriptionCard = ({
  isLoadingData,
  subscriptionData,
  hasStripeCustomer,
  isLoadingPortal,
  currentUserType,
  currentUserEmail,
  onManageSubscription,
  onUnsubscribe
}: CurrentSubscriptionCardProps) => {
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

  // Check if this is a permanent account
  const permanentAccountEmails = [
    'iw@thepaintedpainter.com',
    'isaac.wiley99@gmail.com'
  ];
  const isPermanentAccount = currentUserEmail && permanentAccountEmails.includes(currentUserEmail);

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
            
            <div className="mt-4 flex items-center justify-end gap-2">
              {subscriptionData?.subscribed ? (
                <>
                  {hasStripeCustomer && !isPermanentAccount && (
                    <Button
                      variant="outline"
                      onClick={onManageSubscription}
                      disabled={isLoadingPortal}
                    >
                      {isLoadingPortal ? "Loading..." : "Manage Subscription"}
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        Unsubscribe
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will cancel your subscription and you will lose access to premium features. 
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={onUnsubscribe}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Yes, Unsubscribe
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              ) : (
                <Button
                  variant="default"
                  onClick={() => window.location.href = '/subscription'}
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
