
import { RefreshCw, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
  const formatCurrency = (amount: number, currency: string = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  return (
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
  );
};

export default TransactionHistoryCard;
