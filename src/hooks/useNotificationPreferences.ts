
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

interface NotificationPrefs {
  reviewReactions: boolean;
  customerResponses: boolean;
  newReviews: boolean;
  reviewResponses: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

export const useNotificationPreferences = () => {
  const { currentUser } = useAuth();
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPrefs>({
    reviewReactions: true,
    customerResponses: true,
    newReviews: true,
    reviewResponses: true,
    emailNotifications: true,
    pushNotifications: false,
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
      
      console.log("Fetching notification preferences for user:", currentUser.id);
      
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', currentUser.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw error;
      }

      if (data) {
        console.log("Loaded notification preferences:", data);
        setNotificationPrefs({
          reviewReactions: data.review_reactions,
          customerResponses: data.customer_responses,
          newReviews: data.new_reviews,
          reviewResponses: data.review_responses,
          emailNotifications: data.email_notifications,
          pushNotifications: data.push_notifications,
        });
      } else {
        console.log("No notification preferences found, using defaults");
      }
    } catch (error) {
      console.error("Error fetching notification preferences:", error);
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
      
      console.log("Saving notification preferences for user:", currentUser.id, newPrefs);

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
          updated_at: new Date().toISOString(),
        });

      if (error) {
        throw error;
      }

      console.log("Notification preferences saved successfully");
      setNotificationPrefs(newPrefs);
      
      toast.success("Notification preferences saved successfully", {
        description: "Your notification settings have been updated",
      });

    } catch (error) {
      console.error("Error saving notification preferences:", error);
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
