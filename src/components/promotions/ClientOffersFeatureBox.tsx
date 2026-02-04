import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Megaphone, Users, Globe, Star } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import YitchCustomersTab from "./YitchCustomersTab";
import StarRatingSelector from "./StarRatingSelector";
import CreatePromotionDialog from "./CreatePromotionDialog";

interface ClientOffersFeatureBoxProps {
  isSubscribed: boolean;
  isLegacyMember?: boolean;
}

interface PoolCustomer {
  customer_id: string;
  customer_name: string | null;
  review_rating: number | null;
}

const ClientOffersFeatureBox = ({ isSubscribed, isLegacyMember }: ClientOffersFeatureBoxProps) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("your-customers");
  const [customerPool, setCustomerPool] = useState<PoolCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [businessName, setBusinessName] = useState("");

  const isBusinessAccount = currentUser?.type === "business" || currentUser?.type === "admin";

  // Fetch business name
  useEffect(() => {
    const fetchBusinessName = async () => {
      if (!currentUser) return;

      const { data: bizInfo } = await supabase
        .from("business_info")
        .select("business_name")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (bizInfo?.business_name) {
        setBusinessName(bizInfo.business_name);
      } else {
        setBusinessName(currentUser.name || "Your Business");
      }
    };

    fetchBusinessName();
  }, [currentUser]);

  // Fetch customer pool
  useEffect(() => {
    const fetchPool = async () => {
      if (!currentUser) return;
      setIsLoading(true);

      try {
        const { data, error } = await supabase
          .from("business_customer_pool")
          .select("customer_id, customer_name, review_rating")
          .eq("business_id", currentUser.id);

        if (error) throw error;
        setCustomerPool(data || []);
      } catch (error) {
        console.error("Error fetching customer pool:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPool();
  }, [currentUser]);

  if (!isBusinessAccount) return null;

  // Star rating breakdown for "Your Customers"
  const ratingBreakdown = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: customerPool.filter((c) => Math.round(c.review_rating || 0) === rating).length,
  }));

  // Filter by selected rating
  const getFilteredCount = () => {
    if (!selectedRating) return customerPool.length;
    const minAvg = selectedRating - 0.5;
    return customerPool.filter((c) => (c.review_rating || 0) >= minAvg).length;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="h-5 w-5" />
          Yitch Promotions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="your-customers" className="flex-1">
              <Users className="h-4 w-4 mr-2" />
              Your Customers
            </TabsTrigger>
            <TabsTrigger value="yitch-customers" className="flex-1">
              <Globe className="h-4 w-4 mr-2" />
              Yitch Customers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="your-customers" className="space-y-4 mt-4">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading your customer pool...</p>
            ) : customerPool.length === 0 ? (
              <div className="text-center py-6">
                <Users className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No customers in your pool yet. Customers are added when they claim reviews you write.
                </p>
              </div>
            ) : (
              <>
                {/* Star rating breakdown */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Customer Pool ({customerPool.length})</h4>
                  <div className="grid grid-cols-5 gap-2">
                    {ratingBreakdown.map((item) => (
                      <div key={item.rating} className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                        <div className="flex items-center justify-center gap-0.5 mb-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs">{item.rating}</span>
                        </div>
                        <div className="text-lg font-bold">{item.count}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Star rating selector */}
                <StarRatingSelector
                  selectedRating={selectedRating}
                  onRatingChange={setSelectedRating}
                  customerCount={getFilteredCount()}
                />

                {/* Create promotion button */}
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  disabled={getFilteredCount() === 0}
                  className="w-full"
                >
                  <Megaphone className="mr-2 h-4 w-4" />
                  Create Promotion for Your Customers
                </Button>

                <CreatePromotionDialog
                  open={showCreateDialog}
                  onOpenChange={setShowCreateDialog}
                  targetType="your_customers"
                  recipientCount={getFilteredCount()}
                  minRating={selectedRating || undefined}
                  businessName={businessName}
                />
              </>
            )}
          </TabsContent>

          <TabsContent value="yitch-customers" className="mt-4">
            <YitchCustomersTab
              isSubscribed={isSubscribed}
              isLegacyMember={isLegacyMember}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ClientOffersFeatureBox;
