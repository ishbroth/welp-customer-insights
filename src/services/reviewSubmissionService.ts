import { logger } from '@/utils/logger';

import { supabase } from "@/integrations/supabase/client";

const serviceLogger = logger.withContext('ReviewSubmission');

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
  isAnonymous?: boolean;
}

export const submitReviewToDatabase = async (
  reviewData: ReviewSubmissionData,
  businessId: string,
  isEditing: boolean,
  reviewId?: string | null
): Promise<string> => {
  serviceLogger.debug("SUBMISSION START - Raw reviewData:", reviewData);
  serviceLogger.debug("SUBMISSION - customerNickname:", reviewData.customerNickname);
  serviceLogger.debug("SUBMISSION - customerBusinessName:", reviewData.customerBusinessName);

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
      serviceLogger.debug("Found existing customer by phone:", customerId);
      
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
        serviceLogger.debug("Created new customer profile:", customerId);
      }
    }
  }

  // Filter out empty associates and limit to maximum 3
  const filteredAssociates = (reviewData.associates || [])
    .filter(associate => associate.firstName.trim() !== '' || associate.lastName.trim() !== '')
    .slice(0, 3); // Ensure maximum 3 associates

  // Check if is_anonymous column exists by making a test query
  let hasAnonymousColumn = false;
  try {
    const { data: testData, error: testError } = await supabase
      .from('reviews')
      .select('is_anonymous')
      .limit(1);

    hasAnonymousColumn = !testError;
    serviceLogger.debug("Anonymous column check:", hasAnonymousColumn ? "EXISTS" : "MISSING");
  } catch (e) {
    serviceLogger.warn("Could not check for is_anonymous column, proceeding without it");
  }

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
    // Only include is_anonymous if column exists
    ...(hasAnonymousColumn && { is_anonymous: reviewData.isAnonymous || false }),
    // Clear deleted_at when editing to make the review visible again
    ...(isEditing && { deleted_at: null })
  };

  serviceLogger.debug("=== REVIEW SUBMISSION DEBUG ===");
  serviceLogger.debug("Raw associates input:", reviewData.associates);
  serviceLogger.debug("Filtered associates (max 3):", filteredAssociates);
  serviceLogger.debug("Nickname being saved:", reviewData.customerNickname);
  serviceLogger.debug("Business name being saved:", reviewData.customerBusinessName);
  serviceLogger.debug("Customer state being saved:", reviewData.customerState);
  serviceLogger.debug("Anonymous flag being saved:", reviewData.isAnonymous);
  serviceLogger.debug("Full submission data:", supabaseReviewData);
  serviceLogger.debug("Is editing:", isEditing);
  serviceLogger.debug("Review ID:", reviewId);
  serviceLogger.debug("Associates in submission data:", supabaseReviewData.associates);

  let result;
  let finalReviewId = reviewId;

  if (isEditing && reviewId) {
    // Update existing review
    serviceLogger.debug("UPDATING review with ID:", reviewId);
    serviceLogger.debug("UPDATE data:", supabaseReviewData);
    result = await supabase
      .from('reviews')
      .update(supabaseReviewData)
      .eq('id', reviewId);
    serviceLogger.debug("UPDATE result:", result);
  } else {
    // Insert new review
    serviceLogger.debug("INSERTING new review");
    serviceLogger.debug("INSERT data:", supabaseReviewData);
    result = await supabase
      .from('reviews')
      .insert([supabaseReviewData])
      .select()
      .single();
    serviceLogger.debug("INSERT result:", result);

    if (result.data) {
      finalReviewId = result.data.id;
    }
  }

  if (result.error) {
    serviceLogger.error("Database error:", result.error);
    serviceLogger.error("Error details:", JSON.stringify(result.error, null, 2));
    serviceLogger.error("Error code:", result.error.code);
    serviceLogger.error("Error hint:", result.error.hint);
    serviceLogger.error("Error details specific:", result.error.details);
    throw new Error(`Database error: ${result.error.message} (Code: ${result.error.code})`);
  }

  if (!finalReviewId) {
    throw new Error("Failed to get review ID");
  }

  serviceLogger.info("Review submitted successfully with ID:", finalReviewId);
  return finalReviewId;
};
