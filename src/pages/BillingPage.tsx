
import { useState } from "react";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { useBillingData } from "@/hooks/useBillingData";
import { openCustomerPortal } from "@/services/subscriptionService";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfileSidebar from "@/components/ProfileSidebar";
import BillingPageHeader from "@/components/billing/BillingPageHeader";
import CurrentSubscriptionCard from "@/components/billing/CurrentSubscriptionCard";
import CreditsBalanceCard from "@/components/billing/CreditsBalanceCard";
import PaymentMethodsCard from "@/components/billing/PaymentMethodsCard";
import TransactionHistoryCard from "@/components/billing/TransactionHistoryCard";

const BillingPage = () => {
  const { currentUser } = useAuth();
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const {
    isLoadingData,
    subscriptionData,
    paymentMethods,
    transactions,
    hasStripeCustomer,
    loadBillingData
  } = useBillingData(currentUser);

  const handleManageSubscription = async () => {
    setIsLoadingPortal(true);
    try {
      await openCustomerPortal();
    } catch (error) {
      console.error("Failed to open customer portal:", error);
      toast.error("Failed to open customer portal. Please try again.");
    } finally {
      setIsLoadingPortal(false);
    }
  };

  const handleUnsubscribe = async () => {
    try {
      // This would typically call an unsubscribe endpoint
      toast.success("Unsubscription request processed");
    } catch (error) {
      toast.error("Failed to process unsubscription");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow flex flex-col md:flex-row">
        <ProfileSidebar isOpen={sidebarOpen} toggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 p-6">
          <div className="container mx-auto max-w-6xl">
            <BillingPageHeader 
              isLoadingData={isLoadingData}
              onRefresh={loadBillingData}
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <CurrentSubscriptionCard
                  isLoadingData={isLoadingData}
                  subscriptionData={subscriptionData}
                  hasStripeCustomer={hasStripeCustomer}
                  isLoadingPortal={isLoadingPortal}
                  currentUserType={currentUser?.type}
                  currentUserEmail={currentUser?.email}
                  onManageSubscription={handleManageSubscription}
                  onUnsubscribe={handleUnsubscribe}
                />
                
                <CreditsBalanceCard />
              </div>
              
              <div className="space-y-6">
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
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default BillingPage;
