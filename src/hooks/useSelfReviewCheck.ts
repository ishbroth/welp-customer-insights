
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/utils/logger';

export const useSelfReviewCheck = (customerPhone: string) => {
  const hookLogger = logger.withContext('useSelfReviewCheck');
  const { currentUser } = useAuth();
  const [isSelfReview, setIsSelfReview] = useState(false);
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);

  useEffect(() => {
    const checkSelfReview = async () => {
      if (!currentUser || !customerPhone || customerPhone.length < 10) {
        setIsSelfReview(false);
        return;
      }

      setIsCheckingPhone(true);
      
      try {
        // Clean the input phone number to just digits
        const cleanInputPhone = customerPhone.replace(/\D/g, '');
        
        // Get the current user's profile to check their phone number
        const { data: userProfile, error } = await supabase
          .from('profiles')
          .select('phone')
          .eq('id', currentUser.id)
          .maybeSingle();

        if (error) {
          hookLogger.error("Error checking user phone:", error);
          setIsSelfReview(false);
          return;
        }

        if (userProfile && userProfile.phone) {
          const cleanUserPhone = userProfile.phone.replace(/\D/g, '');
          hookLogger.debug("Self-review check - User phone:", cleanUserPhone, "Input phone:", cleanInputPhone);

          // Check if the cleaned phone numbers match
          if (cleanUserPhone === cleanInputPhone) {
            hookLogger.debug("Self-review detected - phone numbers match");
            setIsSelfReview(true);
          } else {
            setIsSelfReview(false);
          }
        } else {
          setIsSelfReview(false);
        }
      } catch (error) {
        hookLogger.error("Error in self-review check:", error);
        setIsSelfReview(false);
      } finally {
        setIsCheckingPhone(false);
      }
    };

    // Debounce the check
    const timeoutId = setTimeout(checkSelfReview, 500);
    return () => clearTimeout(timeoutId);
  }, [customerPhone, currentUser]);

  return {
    isSelfReview,
    isCheckingPhone
  };
};
