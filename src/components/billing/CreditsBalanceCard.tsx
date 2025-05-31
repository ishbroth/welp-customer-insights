
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, ShoppingCart, RefreshCw } from "lucide-react";
import { useCredits } from "@/hooks/useCredits";

const CreditsBalanceCard = () => {
  const { balance, transactions, isLoading, loadCreditsData } = useCredits();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadCreditsData();
    setIsRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'bg-green-100 text-green-800';
      case 'usage':
        return 'bg-red-100 text-red-800';
      case 'refund':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const recentTransactions = transactions.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Credits Balance
            </CardTitle>
            <CardDescription>Your current credit balance and recent transactions</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Loading credit balance...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Current Balance */}
            <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {balance} Credits
              </div>
              <div className="text-sm text-gray-600 mb-4">
                Value: ${(balance * 3).toFixed(2)}
              </div>
              <Link to="/buy-credits">
                <Button className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Buy More Credits
                </Button>
              </Link>
            </div>

            {/* Recent Transactions */}
            <div>
              <h4 className="font-medium mb-3 flex items-center justify-between">
                Recent Transactions
                {transactions.length > 5 && (
                  <span className="text-sm text-gray-500">
                    Showing 5 of {transactions.length}
                  </span>
                )}
              </h4>
              
              {recentTransactions.length > 0 ? (
                <div className="space-y-2">
                  {recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 border border-gray-100 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant="outline"
                            className={getTransactionColor(transaction.type)}
                          >
                            {transaction.type}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {formatDate(transaction.created_at)}
                          </span>
                        </div>
                        <div className="text-sm">
                          {transaction.description || `${transaction.type} transaction`}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${
                          transaction.type === 'usage' ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {transaction.type === 'usage' ? '' : '+'}
                          {transaction.amount} credits
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <CreditCard className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>No transactions yet</p>
                  <p className="text-sm">Purchase credits to get started</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CreditsBalanceCard;
