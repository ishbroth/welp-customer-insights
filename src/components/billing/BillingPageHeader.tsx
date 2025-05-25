
import { RefreshCw, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BillingPageHeaderProps {
  isLoadingData: boolean;
  onRefresh: () => void;
}

const BillingPageHeader = ({ isLoadingData, onRefresh }: BillingPageHeaderProps) => {
  return (
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
        onClick={onRefresh}
        disabled={isLoadingData}
        className="mt-2"
      >
        {isLoadingData ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
        Refresh Data
      </Button>
    </div>
  );
};

export default BillingPageHeader;
