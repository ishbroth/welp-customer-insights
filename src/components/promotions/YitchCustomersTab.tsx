import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Megaphone, Info } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import LocationFilter from "./LocationFilter";
import StarRatingSelector from "./StarRatingSelector";
import WeeklyLimitDisplay from "./WeeklyLimitDisplay";
import CreatePromotionDialog from "./CreatePromotionDialog";

interface YitchCustomersTabProps {
  isSubscribed: boolean;
  isLegacyMember?: boolean;
}

interface StarBreakdownItem {
  rating: number;
  label: string;
  count: number;
}

const YitchCustomersTab = ({ isSubscribed, isLegacyMember }: YitchCustomersTabProps) => {
  const { currentUser } = useAuth();
  const [locationFilter, setLocationFilter] = useState<{ city?: string; zipCodes?: string[] }>({});
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [starBreakdown, setStarBreakdown] = useState<StarBreakdownItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const [canSend, setCanSend] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [businessName, setBusinessName] = useState("");

  const hasAccess = isSubscribed || isLegacyMember;

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

  // Fetch global pool data
  const fetchPoolData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("get-global-customer-pool", {
        body: {
          city: locationFilter.city,
          zipCodes: locationFilter.zipCodes,
          minRating: selectedRating,
        },
      });

      if (error) throw error;

      setStarBreakdown(data.starBreakdown || []);
      setTotalCount(data.totalCount || 0);
      setFilteredCount(data.filteredCount || data.totalCount || 0);
    } catch (error) {
      console.error("Error fetching pool data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [locationFilter, selectedRating]);

  useEffect(() => {
    fetchPoolData();
  }, [fetchPoolData]);

  if (!hasAccess) {
    return (
      <div className="text-center py-8">
        <Megaphone className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
        <h3 className="font-medium mb-2">Yitch Customers Promotions</h3>
        <p className="text-sm text-muted-foreground">
          Subscribe or become a legacy member to send promotions to all Yitch customers in your area.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info section */}
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-2">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-blue-500 dark:text-blue-400 mt-0.5 shrink-0" />
          <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <p>Target all Yitch customers in your area (available once per week)</p>
            <p>Customers with promotional emails disabled will not receive your message</p>
          </div>
        </div>
      </div>

      {/* Weekly limit */}
      {currentUser && (
        <WeeklyLimitDisplay
          businessId={currentUser.id}
          onLimitCheck={setCanSend}
        />
      )}

      {/* Location filter */}
      <LocationFilter onFilterChange={setLocationFilter} />

      {/* Star pool display */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Customer Pool</h4>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading pool data...</p>
        ) : (
          <>
            <div className="grid grid-cols-5 gap-2">
              {starBreakdown.map((item) => (
                <div key={item.rating} className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <div className="text-lg font-bold">{item.count}</div>
                  <div className="text-xs text-muted-foreground">{item.label}</div>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Total eligible customers: {totalCount}
            </p>
          </>
        )}
      </div>

      {/* Star rating selector */}
      <StarRatingSelector
        selectedRating={selectedRating}
        onRatingChange={setSelectedRating}
        customerCount={filteredCount}
      />

      {/* Create promotion button */}
      <Button
        onClick={() => setShowCreateDialog(true)}
        disabled={!canSend || filteredCount === 0}
        className="w-full"
      >
        <Megaphone className="mr-2 h-4 w-4" />
        Create Yitch Promotion
      </Button>

      {/* Create dialog */}
      <CreatePromotionDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        targetType="yitch_customers"
        recipientCount={filteredCount}
        minRating={selectedRating || undefined}
        locationFilter={locationFilter}
        businessName={businessName}
      />
    </div>
  );
};

export default YitchCustomersTab;
