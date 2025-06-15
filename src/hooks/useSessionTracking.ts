
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

export const useSessionTracking = () => {
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    const trackSession = async () => {
      // Update user's last login session
      await supabase
        .from('user_sessions')
        .upsert({
          user_id: currentUser.id,
          last_login: new Date().toISOString()
        });
    };

    trackSession();
  }, [currentUser]);

  const markReviewAsShown = async (reviewId: string) => {
    if (!currentUser) return;

    await supabase
      .from('user_review_notifications')
      .upsert({
        user_id: currentUser.id,
        review_id: reviewId,
        shown_at: new Date().toISOString()
      });
  };

  return {
    markReviewAsShown
  };
};
