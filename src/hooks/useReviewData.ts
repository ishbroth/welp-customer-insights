
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/utils/logger';

const hookLogger = logger.withContext('useReviewData');

interface ReviewPhoto {
  id: string;
  photo_url: string;
  caption: string | null;
  display_order: number;
}

export const useReviewData = (reviewId: string, hasFullAccess: boolean) => {
  const [photos, setPhotos] = useState<ReviewPhoto[]>([]);
  const [fullReviewContent, setFullReviewContent] = useState<string>("");

  useEffect(() => {
    const fetchReviewData = async () => {
      // Fetch photos
      const { data: photoData, error: photoError } = await supabase
        .from('review_photos')
        .select('*')
        .eq('review_id', reviewId)
        .order('display_order');

      if (photoError) {
        hookLogger.error("Error fetching review photos:", photoError);
      } else {
        setPhotos(photoData || []);
      }

      // Fetch full review content if user has access
      if (hasFullAccess) {
        const { data: reviewData, error: reviewError } = await supabase
          .from('reviews')
          .select('content')
          .eq('id', reviewId)
          .single();

        if (reviewError) {
          hookLogger.error("Error fetching review content:", reviewError);
        } else {
          setFullReviewContent(reviewData?.content || "");
        }
      }
    };

    fetchReviewData();
  }, [reviewId, hasFullAccess]);

  return { photos, fullReviewContent };
};
