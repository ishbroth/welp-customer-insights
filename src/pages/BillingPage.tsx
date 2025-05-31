
import { useState } from "react";
import { useAuth } from "@/contexts/auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfileSidebar from "@/components/ProfileSidebar";
import { toast } from "@/components/ui/sonner";
import { openCustomerPortal } from "@/services/subscriptionService";
import { useBillingData } from "@/hooks/useBillingData";
import { useCredits } from "@/hooks/useCredits";
import BillingPageHeader from "@/components/billing/BillingPageHeader";
import CurrentSubscriptionCard from "@/components/billing/CurrentSubscriptionCard";
import PaymentMethodsCard from "@/components/billing/PaymentMethodsCard";
import TransactionHistoryCard from "@/components/billing/TransactionHistoryCard";
import CreditsBalanceCard from "@/components/billing/CreditsBalanceCard";
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";

const BillingPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser } = useAuth();
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const [searchParams] = useSearchParams();
  const { processSuccessfulPurchase } = useCredits();
  
  const {
    isLoadingData,
    subscriptionData,
    paymentMethods,
    transactions,
    hasStripeCustomer,
    setHasStripeCustomer,
    loadBillingData
  } = useBillingData(currentUser);

  // Handle successful credit purchase
  useEffect(() => {
    const success = searchParams.get('success');
    const credits = searchParams.get('credits');
    
    if (success === 'true' && credits) {
      const creditAmount = parseInt(credits);
      if (!isNaN(creditAmount)) {
        processSuccessfulPurchase(creditAmount);
        
        // Clean up URL parameters
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('success');
        newUrl.searchParams.delete('credits');
        window.history.replaceState({}, '', newUrl.toString());
      }
    }
  }, [searchParams, processSuccessfulPurchase]);

  // Handle opening Stripe customer portal
  const handleManageSubscription = async () => {
    if (!hasStripeCustomer) {
      toast.error("You need to have an active subscription to manage payment methods. Please subscribe first.");
      return;
    }

    try {
      setIsLoadingPortal(true);
      console.log("Opening customer portal for user:", currentUser?.email);
      await openCustomerPortal();
    } catch (error: any) {
      console.error("Error opening customer portal:", error);
      
      // Handle specific error cases
      if (error.message?.includes("No Stripe customer found")) {
        toast.error("You need to subscribe first to manage your billing settings.");
        setHasStripeCustomer(false);
      } else {
        toast.error("Could not open subscription management portal. Please try again.");
      }
      setIsLoadingPortal(false);
    }
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
            <BillingPageHeader 
              isLoadingData={isLoadingData}
              onRefresh={loadBillingData}
            />

            <div className="space-y-6">
              <CreditsBalanceCard />

              <CurrentSubscriptionCard
                isLoadingData={isLoadingData}
                subscriptionData={subscriptionData}
                hasStripeCustomer={hasStripeCustomer}
                isLoadingPortal={isLoadingPortal}
                currentUserType={currentUser?.type}
                onManageSubscription={handleManageSubscription}
              />

              <PaymentMethodsCard
                isLoadingData={isLoadingData}
                paymentMethods={paymentMethods}
                hasStripeCustomer={hasStripeCustomer}
                isLoadingPortal={isLoadingPortal}
                onManageSubscription={handleManageSubscription}
              />

              <TransactionHistoryCard
                isLoadingData={isLoadingData}
                transactions={transactions}
                hasStripeCustomer={hasStripeCustomer}
              />
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default BillingPage;
