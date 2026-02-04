
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { logger } from '@/utils/logger';

interface NotificationPrefs {
  reviewReactions: boolean;
  customerResponses: boolean;
  newReviews: boolean;
  reviewResponses: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  allowYitchPromotions: boolean;
  allowClaimedBusinessPromotions: boolean;
}

export const useNotificationPreferences = () => {
  const hookLogger = logger.withContext('useNotificationPreferences');
  const { currentUser } = useAuth();
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPrefs>({
    reviewReactions: true,
    customerResponses: true,
    newReviews: true,
    reviewResponses: true,
    emailNotifications: true,
    pushNotifications: false,
    allowYitchPromotions: true,
    allowClaimedBusinessPromotions: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch notification preferences from database
  useEffect(() => {
    if (currentUser) {
      fetchNotificationPreferences();
    }
  }, [currentUser]);

  const fetchNotificationPreferences = async () => {
    if (!currentUser) return;

    try {
      setIsLoading(true);

      hookLogger.debug("Fetching notification preferences for user:", currentUser.id);

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', currentUser.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw error;
      }

      if (data) {
        hookLogger.debug("Loaded notification preferences:", data);
        setNotificationPrefs({
          reviewReactions: data.review_reactions,
          customerResponses: data.customer_responses,
          newReviews: data.new_reviews,
          reviewResponses: data.review_responses,
          emailNotifications: data.email_notifications,
          pushNotifications: data.push_notifications,
          allowYitchPromotions: data.allow_yitch_promotions ?? true,
          allowClaimedBusinessPromotions: data.allow_claimed_business_promotions ?? true,
        });
      } else {
        hookLogger.debug("No notification preferences found, using defaults");
      }
    } catch (error) {
      hookLogger.error("Error fetching notification preferences:", error);
      toast.error("Error loading notification preferences", {
        description: "We'll use default settings for now.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateNotificationPreferences = async (newPrefs: NotificationPrefs) => {
    if (!currentUser) return;

    try {
      setIsSaving(true);

      hookLogger.debug("Saving notification preferences for user:", currentUser.id, newPrefs);

      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: currentUser.id,
          review_reactions: newPrefs.reviewReactions,
          customer_responses: newPrefs.customerResponses,
          new_reviews: newPrefs.newReviews,
          review_responses: newPrefs.reviewResponses,
          email_notifications: newPrefs.emailNotifications,
          push_notifications: newPrefs.pushNotifications,
          allow_yitch_promotions: newPrefs.allowYitchPromotions,
          allow_claimed_business_promotions: newPrefs.allowClaimedBusinessPromotions,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        throw error;
      }

      hookLogger.info("Notification preferences saved successfully");
      setNotificationPrefs(newPrefs);

      toast.success("Notification preferences saved successfully", {
        description: "Your notification settings have been updated",
      });

    } catch (error) {
      hookLogger.error("Error saving notification preferences:", error);
      toast.error("Error saving notification preferences", {
        description: "Please try again later.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleChange = (key: keyof NotificationPrefs) => {
    setNotificationPrefs(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return {
    notificationPrefs,
    isLoading,
    isSaving,
    handleToggleChange,
    savePreferences: () => updateNotificationPreferences(notificationPrefs),
    fetchNotificationPreferences
  };
};
