
import React, { useState, useEffect } from "react";
import PhotoGallery from "@/components/reviews/PhotoGallery";
import { supabase } from "@/integrations/supabase/client";

interface ReviewPhoto {
  id: string;
  photo_url: string;
  caption: string | null;
  display_order: number;
}

interface BusinessReviewCardPhotosProps {
  reviewId: string;
}

const BusinessReviewCardPhotos: React.FC<BusinessReviewCardPhotosProps> = ({
  reviewId,
}) => {
  const [photos, setPhotos] = useState<ReviewPhoto[]>([]);

  useEffect(() => {
    const fetchPhotos = async () => {
      const { data, error } = await supabase
        .from('review_photos')
        .select('*')
        .eq('review_id', reviewId)
        .order('display_order');

      if (error) {
        console.error("Error fetching review photos:", error);
      } else {
        setPhotos(data || []);
      }
    };

    fetchPhotos();
  }, [reviewId]);

  return (
    <PhotoGallery 
      photos={photos} 
      hasAccess={true} // Business owners always have access to their own review photos
    />
  );
};

export default BusinessReviewCardPhotos;
