
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/utils/logger';

const hookLogger = logger.withContext('useBillingData');

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

export const useBillingData = (currentUser: any) => {
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [hasStripeCustomer, setHasStripeCustomer] = useState(false);

  // Check if this is a permanent account that should show mock data
  const permanentAccountEmails = [
    'iw@thepaintedpainter.com',
    'isaac.wiley99@gmail.com'
  ];
  const isPermanentAccount = currentUser?.email && permanentAccountEmails.includes(currentUser.email);

  const getMockBillingData = () => {
    const mockSubscriptionData: SubscriptionData = {
      subscribed: true,
      subscription_tier: "Premium",
      subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
    };

    const mockPaymentMethods: PaymentMethod[] = [
      {
        id: "pm_mock_123",
        type: "card",
        card: {
          brand: "visa",
          last4: "4242",
          exp_month: 12,
          exp_year: 2025
        }
      }
    ];

    const mockTransactions: Transaction[] = [
      {
        id: "ch_mock_1",
        amount: 1199, // $11.99
        currency: "usd",
        status: "succeeded",
        created: Math.floor(Date.now() / 1000) - 86400, // 1 day ago
        description: "Business Premium Subscription"
      },
      {
        id: "ch_mock_2",
        amount: 1199,
        currency: "usd",
        status: "succeeded",
        created: Math.floor(Date.now() / 1000) - 86400 * 31, // 31 days ago
        description: "Business Premium Subscription"
      },
      {
        id: "ch_mock_3",
        amount: 1199,
        currency: "usd",
        status: "succeeded",
        created: Math.floor(Date.now() / 1000) - 86400 * 62, // 62 days ago
        description: "Business Premium Subscription"
      }
    ];

    return {
      subscriptionData: mockSubscriptionData,
      paymentMethods: mockPaymentMethods,
      transactions: mockTransactions
    };
  };

  const loadBillingData = async () => {
    if (!currentUser) return;
    
    setIsLoadingData(true);

    try {
      hookLogger.info("Loading billing data for user:", currentUser.email);

      // If this is a permanent account, use mock data
      if (isPermanentAccount) {
        hookLogger.debug("Using mock data for permanent account");
        const mockData = getMockBillingData();
        setSubscriptionData(mockData.subscriptionData);
        setPaymentMethods(mockData.paymentMethods);
        setTransactions(mockData.transactions);
        setHasStripeCustomer(true);
        setIsLoadingData(false);
        return;
      }
      
      // Check subscription status for regular accounts
      const { data: subData, error: subError } = await supabase.functions.invoke("check-subscription");

      if (subError) {
        hookLogger.error("Error checking subscription:", subError);
        // If the error is about no Stripe customer, that's expected for new users
        if (subError.message?.includes("No Stripe customer found")) {
          setHasStripeCustomer(false);
          setSubscriptionData({ subscribed: false });
        } else {
          // Only log unexpected errors, don't show toast
          hookLogger.error("Unexpected subscription error:", subError);
        }
      } else {
        hookLogger.debug("Subscription data:", subData);
        setSubscriptionData(subData);
        setHasStripeCustomer(true);
      }

      // Load payment methods and transactions through a billing info edge function
      const { data: billingData, error: billingError } = await supabase.functions.invoke("get-billing-info");

      if (billingError) {
        hookLogger.error("Error loading billing info:", billingError);
        // Don't show error for missing customer - this is normal for new users
        if (!billingError.message?.includes("No Stripe customer found")) {
          hookLogger.error("Unexpected billing error:", billingError);
        }
        // Set empty arrays for new users without Stripe customers
        setPaymentMethods([]);
        setTransactions([]);
      } else {
        hookLogger.debug("Billing data:", billingData);
        setPaymentMethods(billingData?.payment_methods || []);
        setTransactions(billingData?.transactions || []);
        setHasStripeCustomer(true);
      }
    } catch (error) {
      hookLogger.error("Error in loadBillingData:", error);
      // Only log unexpected errors, don't show toast for missing Stripe customer
      if (!error.message?.includes("No Stripe customer found")) {
        hookLogger.error("Unexpected error in loadBillingData:", error);
      }
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    loadBillingData();
  }, [currentUser]);

  return {
    isLoadingData,
    subscriptionData,
    paymentMethods,
    transactions,
    hasStripeCustomer,
    setHasStripeCustomer,
    loadBillingData
  };
};
