import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

const BillingPage = () => {
  const [loading, setLoading] = useState(false);
  const { currentUser, isSubscribed } = useAuth();

  const handleSubscription = async () => {
    setLoading(true);
    try {
      // Placeholder for subscription logic
      toast.success("Subscription feature coming soon!");
    } catch (error) {
      toast.error("Failed to process subscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Billing & Subscription</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>
              Manage your subscription and billing information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Status:</span>
              <span className={`px-2 py-1 rounded text-sm ${
                isSubscribed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {isSubscribed ? 'Active' : 'Free'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="font-medium">User:</span>
              <span>{currentUser?.name || currentUser?.email}</span>
            </div>
            
            {!isSubscribed && (
              <div className="pt-4">
                <Button 
                  onClick={handleSubscription}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Processing..." : "Upgrade to Premium"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BillingPage;
