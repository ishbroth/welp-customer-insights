import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Clock, CheckCircle } from "lucide-react";

interface WeeklyLimitDisplayProps {
  businessId: string;
  onLimitCheck?: (canSend: boolean) => void;
}

const WeeklyLimitDisplay = ({ businessId, onLimitCheck }: WeeklyLimitDisplayProps) => {
  const [canSend, setCanSend] = useState(true);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [lastSentDate, setLastSentDate] = useState<string | null>(null);
  const [nextAvailableDate, setNextAvailableDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkLimit = async () => {
      try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data } = await supabase
          .from("yitch_promotion_log")
          .select("sent_at")
          .eq("business_id", businessId)
          .eq("target_type", "yitch_customers")
          .gte("sent_at", sevenDaysAgo.toISOString())
          .order("sent_at", { ascending: false })
          .limit(1);

        if (data && data.length > 0) {
          const lastSent = new Date(data[0].sent_at);
          const nextDate = new Date(lastSent.getTime() + 7 * 24 * 60 * 60 * 1000);
          const now = new Date();

          if (nextDate > now) {
            const diffMs = nextDate.getTime() - now.getTime();
            const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
            setCanSend(false);
            setDaysRemaining(diffDays);
            setLastSentDate(lastSent.toLocaleDateString());
            setNextAvailableDate(nextDate.toLocaleDateString());
            onLimitCheck?.(false);
          } else {
            setCanSend(true);
            setLastSentDate(lastSent.toLocaleDateString());
            onLimitCheck?.(true);
          }
        } else {
          setCanSend(true);
          onLimitCheck?.(true);
        }
      } catch (error) {
        console.error("Error checking weekly limit:", error);
        setCanSend(true);
        onLimitCheck?.(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (businessId) checkLimit();
  }, [businessId, onLimitCheck]);

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Checking promotion availability...</div>;
  }

  if (canSend) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
        <CheckCircle className="h-4 w-4" />
        <span>You can send a Yitch Customers promotion</span>
        {lastSentDate && (
          <span className="text-muted-foreground">(last sent: {lastSentDate})</span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
        <Clock className="h-4 w-4" />
        <span>Next Yitch Customers promotion available in {daysRemaining} day{daysRemaining !== 1 ? "s" : ""}</span>
      </div>
      {nextAvailableDate && (
        <p className="text-xs text-muted-foreground ml-6">Available on {nextAvailableDate}</p>
      )}
    </div>
  );
};

export default WeeklyLimitDisplay;
