
import { supabase } from "@/integrations/supabase/client";

export interface ReviewSubmissionData {
  rating: number;
  comment: string;
  customerFirstName: string;
  customerLastName: string;
  customerNickname?: string;
  customerBusinessName?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerCity?: string;
  customerState?: string;
  customerZipCode?: string;
  associates?: Array<{ firstName: string; lastName: string }>;
}

export const submitReviewToDatabase = async (
  reviewData: ReviewSubmissionData,
  businessId: string,
  isEditing: boolean,
  reviewId?: string | null
): Promise<string> => {
  console.log("🔍 SUBMISSION START - Raw reviewData:", reviewData);
  console.log("🔍 SUBMISSION - customerNickname:", reviewData.customerNickname);
  console.log("🔍 SUBMISSION - customerBusinessName:", reviewData.customerBusinessName);

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

  // Filter out empty associates and limit to maximum 3
  const filteredAssociates = (reviewData.associates || [])
    .filter(associate => associate.firstName.trim() !== '' || associate.lastName.trim() !== '')
    .slice(0, 3); // Ensure maximum 3 associates

  const supabaseReviewData = {
    business_id: businessId,
    rating: reviewData.rating,
    content: reviewData.comment,
    customer_name: fullName,
    customer_nickname: reviewData.customerNickname || null,
    customer_business_name: reviewData.customerBusinessName || null,
    customer_address: reviewData.customerAddress,
    customer_city: reviewData.customerCity,
    customer_state: reviewData.customerState,
    customer_zipcode: reviewData.customerZipCode,
    customer_phone: reviewData.customerPhone,
    associates: filteredAssociates,
    // Clear deleted_at when editing to make the review visible again
    ...(isEditing && { deleted_at: null })
  };
  
  console.log("=== REVIEW SUBMISSION DEBUG ===");
  console.log("Raw associates input:", reviewData.associates);
  console.log("Filtered associates (max 3):", filteredAssociates);
  console.log("Nickname being saved:", reviewData.customerNickname);
  console.log("Business name being saved:", reviewData.customerBusinessName);
  console.log("Customer state being saved:", reviewData.customerState);
  console.log("Full submission data:", supabaseReviewData);
  console.log("Is editing:", isEditing);
  console.log("Review ID:", reviewId);
  console.log("Associates in submission data:", supabaseReviewData.associates);
  
  let result;
  let finalReviewId = reviewId;
  
  if (isEditing && reviewId) {
    // Update existing review
    console.log("🔄 UPDATING review with ID:", reviewId);
    console.log("🔄 UPDATE data:", supabaseReviewData);
    result = await supabase
      .from('reviews')
      .update(supabaseReviewData)
      .eq('id', reviewId);
    console.log("🔄 UPDATE result:", result);
  } else {
    // Insert new review
    console.log("➕ INSERTING new review");
    console.log("➕ INSERT data:", supabaseReviewData);
    result = await supabase
      .from('reviews')
      .insert([supabaseReviewData])
      .select()
      .single();
    console.log("➕ INSERT result:", result);

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
