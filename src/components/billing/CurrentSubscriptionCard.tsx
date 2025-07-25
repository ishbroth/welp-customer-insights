
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Crown, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/auth";

interface CurrentSubscriptionCardProps {
  isLoadingData: boolean;
  subscriptionData: any;
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
  const { currentUser } = useAuth();

  // Check if this is a permanent account
  const permanentAccountEmails = [
    'iw@thepaintedpainter.com',
    'isaac.wiley99@gmail.com'
  ];
  const isPermanentAccount = currentUserEmail && permanentAccountEmails.includes(currentUserEmail);

  // Route based on user type
  const getSubscriptionRoute = () => {
    if (currentUser?.type === "business") {
      return "/subscription";
    } else {
      return "/customer-benefits";
    }
  };

  if (isLoadingData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading Subscription...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show permanent account status
  if (isPermanentAccount) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Permanent Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              Lifetime Access
            </Badge>
          </div>
          <p className="text-sm text-gray-600">
            This account has permanent subscription access with all premium features included.
          </p>
          <div className="text-sm text-gray-500">
            <p>• Unlimited access to all features</p>
            <p>• No recurring charges</p>
            <p>• Grandfathered into future updates</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show subscription status for regular users
  const isSubscribed = subscriptionData?.subscribed || false;
  const tier = subscriptionData?.subscription_tier || 'Basic';
  const endDate = subscriptionData?.subscription_end;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Current Subscription
          {isSubscribed && (
            <Badge variant="default" className="bg-green-100 text-green-800">
              Active
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isSubscribed ? (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Plan:</span>
                <span>{tier}</span>
              </div>
              {endDate && (
                <div className="flex items-center justify-between">
                  <span className="font-medium">Next billing:</span>
                  <span>{format(new Date(endDate), 'MMM dd, yyyy')}</span>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Button 
                onClick={onManageSubscription}
                disabled={isLoadingPortal}
                className="w-full"
              >
                {isLoadingPortal ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Manage Subscription'
                )}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <span className="text-sm">No active subscription</span>
              </div>
              <p className="text-sm text-gray-600">
                You're currently on the basic plan with limited features.
              </p>
            </div>
            
            <div className="space-y-2">
              <Link to={getSubscriptionRoute()} className="block w-full">
                <Button className="w-full welp-button">
                  Subscribe Now
                </Button>
              </Link>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CurrentSubscriptionCard;
