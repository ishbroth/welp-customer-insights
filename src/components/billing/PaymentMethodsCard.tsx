
import { RefreshCw, CreditCard, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
}

interface PaymentMethodsCardProps {
  isLoadingData: boolean;
  paymentMethods: PaymentMethod[];
  hasStripeCustomer: boolean;
  isLoadingPortal: boolean;
  onManageSubscription: () => void;
}

const PaymentMethodsCard = ({
  isLoadingData,
  paymentMethods,
  hasStripeCustomer,
  isLoadingPortal,
  onManageSubscription
}: PaymentMethodsCardProps) => {
  // Check if this is a permanent account
  const permanentAccountEmails = [
    'iw@thepaintedpainter.com',
    'isaac.wiley99@gmail.com'
  ];
  
  // Get current user email from auth context would be ideal, but for now we'll check if hasStripeCustomer is false
  // and show appropriate message for permanent accounts
  const isPermanentAccount = !hasStripeCustomer && paymentMethods.length === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Methods</CardTitle>
        <CardDescription>Your current payment methods on file</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoadingData ? (
          <div className="flex items-center justify-center p-4">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Loading payment methods...
          </div>
        ) : paymentMethods.length > 0 ? (
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="bg-gray-100 p-2 rounded">
                    <CreditCard className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {method.card?.brand?.toUpperCase()} ending in {method.card?.last4}
                    </p>
                    <p className="text-sm text-gray-500">
                      Expires {method.card?.exp_month}/{method.card?.exp_year}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            <div className="pt-2">
              <Button 
                variant="outline"
                onClick={onManageSubscription}
                disabled={isLoadingPortal}
              >
                {isLoadingPortal ? "Loading..." : "Manage Payment Methods"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            {isPermanentAccount ? (
              <div className="flex items-center justify-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-blue-600 mr-2" />
                <p className="text-blue-800">This account has permanent subscription access and does not require payment methods</p>
              </div>
            ) : hasStripeCustomer ? (
              <div>
                <p className="text-gray-500 mb-4">No payment methods found</p>
              </div>
            ) : (
              <div className="flex items-center justify-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                <p className="text-yellow-800">Subscribe to a plan to add payment methods</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentMethodsCard;
