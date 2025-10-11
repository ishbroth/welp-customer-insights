import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

const hookLogger = logger.withContext('useReviewCount');

export const useReviewCount = () => {
  const [reviewCount, setReviewCount] = useState(1250);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReviewCount = async () => {
      try {
        const { count, error } = await supabase
          .from('reviews')
          .select('*', { count: 'exact', head: true });

        if (error) {
          hookLogger.error('Error fetching review count:', error);
          setReviewCount(1250); // fallback to 1250 on error
        } else {
          // Show actual count only if it exceeds 1250, otherwise show 1250
          setReviewCount(count && count > 1250 ? count : 1250);
        }
      } catch (error) {
        hookLogger.error('Error fetching review count:', error);
        setReviewCount(1250); // fallback to 1250 on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviewCount();
  }, []);

  return { reviewCount, isLoading };
};