
import { supabase } from "@/integrations/supabase/client";

export interface ReviewSubmissionData {
  rating: number;
  comment: string;
  customerFirstName: string;
  customerLastName: string;
  customerPhone?: string;
  customerAddress?: string;
  customerCity?: string;
  customerState?: string;
  customerZipCode?: string;
}

export const submitReviewToDatabase = async (
  reviewData: ReviewSubmissionData,
  businessId: string,
  isEditing: boolean,
  reviewId?: string | null
): Promise<string> => {
  const supabaseReviewData = {
    business_id: businessId,
    rating: reviewData.rating,
    content: reviewData.comment,
    customer_name: `${reviewData.customerFirstName} ${reviewData.customerLastName}`.trim(),
    customer_address: reviewData.customerAddress,
    customer_city: reviewData.customerCity,
    customer_zipcode: reviewData.customerZipCode,
    customer_phone: reviewData.customerPhone,
  };
  
  console.log("Submitting review with data:", supabaseReviewData);
  
  let result;
  let finalReviewId = reviewId;
  
  if (isEditing && reviewId) {
    // Update existing review
    result = await supabase
      .from('reviews')
      .update(supabaseReviewData)
      .eq('id', reviewId);
  } else {
    // Insert new review
    result = await supabase
      .from('reviews')
      .insert([supabaseReviewData])
      .select()
      .single();
    
    if (result.data) {
      finalReviewId = result.data.id;
    }
  }
  
  if (result.error) {
    console.error("Database error:", result.error);
    throw new Error(result.error.message);
  }

  if (!finalReviewId) {
    throw new Error("Failed to get review ID");
  }

  return finalReviewId;
};
