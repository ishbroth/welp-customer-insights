
import { RefreshCw, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useCredits } from "@/hooks/useCredits";
import { useAuth } from "@/contexts/auth";
import { formatDate as formatDateUtil } from "@/utils/dateUtils";

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  description?: string;
}

interface TransactionHistoryCardProps {
  isLoadingData: boolean;
  transactions: Transaction[];
  hasStripeCustomer: boolean;
}

const TransactionHistoryCard = ({
  isLoadingData,
  transactions,
  hasStripeCustomer
}: TransactionHistoryCardProps) => {
  const [showAll, setShowAll] = useState(false);
  const { currentUser } = useAuth();
  const { transactions: creditTransactions } = useCredits();
  
  const formatCurrency = (amount: number, currency: string = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (timestamp: number | string) => {
    const date = typeof timestamp === 'number' ? new Date(timestamp * 1000) : new Date(timestamp);
    return formatDateUtil(date);
  };

  const getTransactionDescription = (stripeTransaction: Transaction, creditTransaction?: any) => {
    const amount = stripeTransaction.amount;
    
    // Legacy payment - $250 one-time payment
    if (amount === 25000) {
      return "Legacy Plan - Lifetime Access";
    }
    
    // Subscription payment - $11.99 recurring
    if (amount === 1199) {
      return "Premium Subscription";
    }
    
    // Credit purchase - multiples of $3 (300 cents)
    if (amount % 300 === 0) {
      const credits = amount / 300;
      return `Credit Purchase - ${credits} credit${credits > 1 ? 's' : ''}`;
    }
    
    // Fallback to original description or credit transaction description
    if (creditTransaction?.description) {
      return creditTransaction.description;
    }
    
    return stripeTransaction.description || "Payment";
  };

  // Create a comprehensive transaction list
  const combinedTransactions = transactions.map(stripeTransaction => {
    // Find matching credit transaction if it exists
    const matchingCreditTransaction = creditTransactions.find(ct => 
      ct.stripe_session_id && (
        ct.stripe_session_id === stripeTransaction.id ||
        stripeTransaction.id.includes(ct.stripe_session_id) ||
        ct.stripe_session_id.includes(stripeTransaction.id)
      )
    );

    return {
      id: stripeTransaction.id,
      amount: stripeTransaction.amount, // Always use the actual Stripe charge amount
      currency: stripeTransaction.currency,
      status: stripeTransaction.status,
      created: stripeTransaction.created,
      description: getTransactionDescription(stripeTransaction, matchingCreditTransaction),
      isCredit: !!matchingCreditTransaction,
      stripeSessionId: matchingCreditTransaction?.stripe_session_id
    };
  }).sort((a, b) => b.created - a.created); // Sort by date, newest first

  // Show only first 3 transactions by default, up to 24 when expanded
  const displayedTransactions = showAll ? combinedTransactions.slice(0, 24) : combinedTransactions.slice(0, 3);
  const hasMoreTransactions = combinedTransactions.length > 3;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>Your recent payments and credit transactions</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoadingData ? (
          <div className="flex items-center justify-center p-4">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Loading transaction history...
          </div>
        ) : combinedTransactions.length > 0 ? (
          <div className="space-y-4">
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
                  {displayedTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-gray-100">
                      <td className="py-3 text-sm">
                        {formatDate(transaction.created)}
                      </td>
                      <td className="py-3 text-sm">
                        {transaction.description}
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
            
            {hasMoreTransactions && (
              <div className="flex justify-center pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAll(!showAll)}
                  className="flex items-center gap-2"
                >
                  {showAll ? (
                    <>
                      Show Less
                      <ChevronUp className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Show All ({combinedTransactions.length > 24 ? '24' : combinedTransactions.length} transactions)
                      <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            )}
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
  );
};

export default TransactionHistoryCard;
