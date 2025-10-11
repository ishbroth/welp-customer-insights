
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/utils/logger';

interface UseDuplicateCheckProps {
  email: string;
  phone: string;
  onDuplicateFound: (hasDuplicate: boolean) => void;
}

export const useDuplicateCheck = ({ email, phone, onDuplicateFound }: UseDuplicateCheckProps) => {
  const hookLogger = logger.withContext('useDuplicateCheck');
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const checkForDuplicates = async () => {
      if (!email.trim() && !phone.trim()) {
        onDuplicateFound(false);
        return;
      }

      setIsChecking(true);

      try {
        hookLogger.debug("Checking for duplicates:", { email, phone });

        const { data, error } = await supabase.functions.invoke('check-duplicates', {
          body: { email: email.trim(), phone: phone.trim() }
        });

        if (error) {
          hookLogger.error('Error checking duplicates:', error);
          onDuplicateFound(false);
          return;
        }

        hookLogger.debug("Duplicate check result:", data);
        onDuplicateFound(data?.hasDuplicates || false);

      } catch (error) {
        hookLogger.error('Unexpected error checking duplicates:', error);
        onDuplicateFound(false);
      } finally {
        setIsChecking(false);
      }
    };

    // Debounce the check
    const timeoutId = setTimeout(checkForDuplicates, 500);
    return () => clearTimeout(timeoutId);
  }, [email, phone, onDuplicateFound]);

  return { isChecking };
};
