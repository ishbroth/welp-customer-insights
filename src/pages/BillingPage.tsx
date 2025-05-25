
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfileSidebar from "@/components/ProfileSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { openCustomerPortal } from "@/services/subscriptionService";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
}

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

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  description?: string;
}

const BillingPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, isSubscribed } = useAuth();
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [hasStripeCustomer, setHasStripeCustomer] = useState(false);

  // Load subscription and billing data
  const loadBillingData = async () => {
    if (!currentUser) return;
    
    setIsLoadingData(true);
    try {
      console.log("Loading billing data for user:", currentUser.email);
      
      // Check subscription status
      const { data: subData, error: subError } = await supabase.functions.invoke("check-subscription");
      
      if (subError) {
        console.error("Error checking subscription:", subError);
        // If the error is about no Stripe customer, that's expected for new users
        if (subError.message?.includes("No Stripe customer found")) {
          setHasStripeCustomer(false);
          setSubscriptionData({ subscribed: false });
        } else {
          toast.error("Error loading subscription data");
        }
      } else {
        console.log("Subscription data:", subData);
        setSubscriptionData(subData);
        setHasStripeCustomer(true);
      }

      // Load payment methods and transactions through a billing info edge function
      const { data: billingData, error: billingError } = await supabase.functions.invoke("get-billing-info");
      
      if (billingError) {
        console.error("Error loading billing info:", billingError);
        // Don't show error for missing customer - this is normal for new users
        if (!billingError.message?.includes("No Stripe customer found")) {
          toast.error("Error loading billing information");
        }
      } else {
        console.log("Billing data:", billingData);
        setPaymentMethods(billingData?.payment_methods || []);
        setTransactions(billingData?.transactions || []);
      }
    } catch (error) {
      console.error("Error in loadBillingData:", error);
      toast.error("Error loading billing data");
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    loadBillingData();
  }, [currentUser]);

  // Handle opening Stripe customer portal
  const handleManageSubscription = async () => {
    if (!hasStripeCustomer) {
      toast.error("You need to have an active subscription to manage payment methods. Please subscribe first.");
      return;
    }

    try {
      setIsLoadingPortal(true);
      await openCustomerPortal();
    } catch (error) {
      console.error("Error opening customer portal:", error);
      toast.error("Could not open subscription management portal. Please try again.");
      setIsLoadingPortal(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const getSubscriptionPlanName = () => {
    if (!subscriptionData?.subscribed) return "No Active Subscription";
    
    const tier = subscriptionData.subscription_tier;
    if (currentUser?.type === "business") {
      return tier ? `Business ${tier} Plan` : "Business Plan";
    }
    return tier ? `Customer ${tier} Plan` : "Customer Plan";
  };

  const getNextBillingDate = () => {
    if (!subscriptionData?.subscription_end) return "N/A";
    return new Date(subscriptionData.subscription_end).toLocaleDateString();
  };

  if (!currentUser) {
    return <div>Please log in to view billing information.</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow flex flex-col md:flex-row">
        <ProfileSidebar isOpen={sidebarOpen} toggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 p-6">
          <div className="container mx-auto max-w-3xl">
            <div className="mb-6">
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <CreditCard className="h-6 w-6" /> Billing & Subscriptions
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your payment methods and view your transaction history
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadBillingData}
                disabled={isLoadingData}
                className="mt-2"
              >
                {isLoadingData ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                Refresh Data
              </Button>
            </div>

            <div className="space-y-6">
              {/* Current Subscription */}
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
                        {hasStripeCustomer ? (
                          <Button
                            variant="default"
                            onClick={handleManageSubscription}
                            disabled={isLoadingPortal}
                          >
                            {isLoadingPortal ? "Loading..." : "Manage Subscription"}
                          </Button>
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

              {/* Payment Method */}
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
                          onClick={handleManageSubscription}
                          disabled={isLoadingPortal}
                        >
                          {isLoadingPortal ? "Loading..." : "Manage Payment Methods"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      {hasStripeCustomer ? (
                        <div>
                          <p className="text-gray-500 mb-4">No payment methods found</p>
                          <Button 
                            variant="outline"
                            onClick={handleManageSubscription}
                            disabled={isLoadingPortal}
                          >
                            {isLoadingPortal ? "Loading..." : "Add Payment Method"}
                          </Button>
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

              {/* Transaction History */}
              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>Your recent payments and charges</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingData ? (
                    <div className="flex items-center justify-center p-4">
                      <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                      Loading transaction history...
                    </div>
                  ) : transactions.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b text-left text-sm text-gray-500">
                            <th className="pb-2 font-medium">Date</th>
                            <th className="pb-2 font-medium">Description</th>
                            <th className="pb-2 font-medium">Status</th>
                            <th className="pb-2 font-medium text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {transactions.map((transaction) => (
                            <tr key={transaction.id} className="border-b border-gray-100">
                              <td className="py-3 text-sm">
                                {formatDate(transaction.created)}
                              </td>
                              <td className="py-3 text-sm">
                                {transaction.description || "Subscription Payment"}
                              </td>
                              <td className="py-3 text-sm">
                                <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                                  transaction.status === 'succeeded' 
                                    ? 'bg-green-100 text-green-800' 
                                    : transaction.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {transaction.status}
                                </span>
                              </td>
                              <td className="py-3 text-sm text-right font-medium">
                                {formatCurrency(transaction.amount, transaction.currency)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      {hasStripeCustomer ? (
                        <p>No transactions found</p>
                      ) : (
                        <div className="flex items-center justify-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <AlertCircle className="h-5 w-5 text-blue-600 mr-2" />
                          <p className="text-blue-800">Transaction history will appear here after your first payment</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default BillingPage;
