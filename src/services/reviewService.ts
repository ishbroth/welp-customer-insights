
import { supabase } from "@/integrations/supabase/client";
import { Review } from "@/types/supabase";

// Create a new review
export const createReview = async (reviewData: Partial<Review>) => {
  try {
    // Make sure required fields are present
    if (!reviewData.customer_id || !reviewData.reviewer_id || !reviewData.rating) {
      throw new Error("Missing required review data");
    }

    // Create a properly typed object for insertion
    const dataToInsert = {
      customer_id: reviewData.customer_id,
      reviewer_id: reviewData.reviewer_id,
      rating: reviewData.rating,
      content: reviewData.content || "",
      address: reviewData.address,
      city: reviewData.city,
      state: reviewData.state,
      zip_code: reviewData.zip_code,
      created_at: reviewData.created_at,
      updated_at: reviewData.updated_at
    };

    const { data, error } = await supabase
      .from('reviews')
      .insert(dataToInsert)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error: any) {
    console.error('Error creating review:', error.message);
    throw error;
  }
};

// Get reviews by customer ID
export const getReviewsByCustomerId = async (customerId: string) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        reviewer:reviewer_id (
          id,
          name
        )
      `)
      .eq('customer_id', customerId);

    if (error) {
      throw error;
    }

    return data;
  } catch (error: any) {
    console.error('Error getting reviews:', error.message);
    throw error;
  }
};

// Get reviews by reviewer ID (business owner)
export const getReviewsByReviewerId = async (reviewerId: string) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        customer:customer_id (*)
      `)
      .eq('reviewer_id', reviewerId);

    if (error) {
      throw error;
    }

    // Transform the data to match our expected types
    const transformedData = data.map((review: any) => ({
      ...review,
      customer: review.customer,
    }));

    return transformedData;
  } catch (error: any) {
    console.error('Error getting reviews by reviewer:', error.message);
    throw error;
  }
};

// Update an existing review
export const updateReview = async (reviewId: string, updateData: Partial<Review>) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .update(updateData)
      .eq('id', reviewId)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error: any) {
    console.error('Error updating review:', error.message);
    throw error;
  }
};

// Delete a review
export const deleteReview = async (reviewId: string) => {
  try {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) {
      throw error;
    }

    return true;
  } catch (error: any) {
    console.error('Error deleting review:', error.message);
    throw error;
  }
};
