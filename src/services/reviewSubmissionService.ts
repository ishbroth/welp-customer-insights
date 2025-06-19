
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
  // Create or find customer profile
  let customerId = null;
  const fullName = `${reviewData.customerFirstName} ${reviewData.customerLastName}`.trim();
  
  if (reviewData.customerPhone) {
    const cleanPhone = reviewData.customerPhone.replace(/\D/g, '');
    
    // Check if customer profile exists by phone
    const { data: existingCustomer } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone', cleanPhone)
      .eq('type', 'customer')
      .maybeSingle();
    
    if (existingCustomer) {
      customerId = existingCustomer.id;
      console.log("Found existing customer by phone:", customerId);
      
      // Update existing customer profile with latest info
      await supabase
        .from('profiles')
        .update({
          name: fullName,
          first_name: reviewData.customerFirstName,
          last_name: reviewData.customerLastName,
          address: reviewData.customerAddress,
          city: reviewData.customerCity,
          state: reviewData.customerState,
          zipcode: reviewData.customerZipCode,
          updated_at: new Date().toISOString()
        })
        .eq('id', customerId);
    } else if (fullName && fullName.length > 1) {
      // Create new customer profile
      const newCustomerId = crypto.randomUUID();
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: newCustomerId,
          name: fullName,
          first_name: reviewData.customerFirstName,
          last_name: reviewData.customerLastName,
          phone: cleanPhone,
          address: reviewData.customerAddress,
          city: reviewData.customerCity,
          state: reviewData.customerState,
          zipcode: reviewData.customerZipCode,
          type: 'customer'
        });
      
      if (!profileError) {
        customerId = newCustomerId;
        console.log("Created new customer profile:", customerId);
      }
    }
  }

  const supabaseReviewData = {
    business_id: businessId,
    customer_id: customerId,
    rating: reviewData.rating,
    content: reviewData.comment,
    customer_name: fullName,
    customer_address: reviewData.customerAddress,
    customer_city: reviewData.customerCity,
    customer_zipcode: reviewData.customerZipCode,
    customer_phone: reviewData.customerPhone,
    // Clear deleted_at when editing to make the review visible again
    ...(isEditing && { deleted_at: null })
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

  console.log("Review submitted successfully with ID:", finalReviewId);
  return finalReviewId;
};
