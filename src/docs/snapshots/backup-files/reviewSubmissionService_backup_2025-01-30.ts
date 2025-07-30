/*
BACKUP FILE - reviewSubmissionService.ts as of 2025-01-30
This is a backup copy for reference purposes

import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export interface ReviewSubmissionData {
  rating: number;
  comment: string;
  photos?: File[];
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  city?: string;
  zipCode?: string;
}

export interface ReviewSubmissionResult {
  success: boolean;
  reviewId?: string;
  error?: string;
}

export const submitReview = async (
  businessId: string,
  customerId: string | null,
  reviewData: ReviewSubmissionData
): Promise<ReviewSubmissionResult> => {
  try {
    console.log('Starting review submission for business:', businessId);
    console.log('Review data:', reviewData);

    // Validate required fields
    if (!reviewData.rating || !reviewData.firstName || !reviewData.lastName) {
      throw new Error('Rating, first name, and last name are required');
    }

    // Combine first and last name
    const fullName = `${reviewData.firstName.trim()} ${reviewData.lastName.trim()}`;

    // Upload photos first if any
    const photoUrls: string[] = [];
    if (reviewData.photos && reviewData.photos.length > 0) {
      console.log('Uploading photos...');
      
      for (const photo of reviewData.photos) {
        const fileExt = photo.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `review-photos/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('review-photos')
          .upload(filePath, photo);

        if (uploadError) {
          console.error('Error uploading photo:', uploadError);
          throw new Error(`Failed to upload photo: ${uploadError.message}`);
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('review-photos')
          .getPublicUrl(filePath);

        if (urlData.publicUrl) {
          photoUrls.push(urlData.publicUrl);
        }
      }
      console.log('Photos uploaded successfully:', photoUrls);
    }

    // Prepare review data for database
    const supabaseReviewData = {
      business_id: businessId,
      rating: reviewData.rating,
      content: reviewData.comment,
      customer_name: fullName,
      customer_phone: reviewData.phone || null,
      customer_address: reviewData.address || null,
      customer_city: reviewData.city || null,
      customer_zipcode: reviewData.zipCode || null,
    };

    console.log('Submitting review to database:', supabaseReviewData);

    // Insert review into database
    const { data: reviewResult, error: reviewError } = await supabase
      .from('reviews')
      .insert([supabaseReviewData])
      .select('id')
      .single();

    if (reviewError) {
      console.error('Error inserting review:', reviewError);
      throw new Error(`Failed to submit review: ${reviewError.message}`);
    }

    const reviewId = reviewResult.id;
    console.log('Review submitted successfully with ID:', reviewId);

    // Insert photo records if any
    if (photoUrls.length > 0) {
      console.log('Inserting photo records...');
      
      const photoRecords = photoUrls.map(url => ({
        review_id: reviewId,
        photo_url: url
      }));

      const { error: photoError } = await supabase
        .from('review_photos')
        .insert(photoRecords);

      if (photoError) {
        console.error('Error inserting photo records:', photoError);
        // Don't throw here as the review was already submitted
        toast.error('Review submitted but failed to save photo records');
      } else {
        console.log('Photo records inserted successfully');
      }
    }

    toast.success('Review submitted successfully!');
    return {
      success: true,
      reviewId: reviewId
    };

  } catch (error) {
    console.error('Review submission error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    toast.error(`Failed to submit review: ${errorMessage}`);
    
    return {
      success: false,
      error: errorMessage
    };
  }
};
*/