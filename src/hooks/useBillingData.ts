
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

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
        setHasStripeCustomer(true);
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
