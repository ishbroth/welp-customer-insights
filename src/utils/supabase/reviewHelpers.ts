import { supabase } from "@/integrations/supabase/client";
import type { Review, ReviewInsert, Response, ResponseInsert } from "@/types/supabase";

/**
 * Get all reviews for a business
 */
export const getBusinessReviews = async (businessId: string) => {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      profiles:customer_id (first_name, last_name)
    `)
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error("Error fetching business reviews:", error);
    throw error;
  }
  
  return data;
};

/**
 * Get all reviews by a customer
 */
export const getCustomerReviews = async (customerId: string) => {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      business_profiles:business_id (
        *,
        business_info (*)
      )
    `)
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error("Error fetching customer reviews:", error);
    throw error;
  }
  
  return data;
};

/**
 * Create a new review
 */
export const createReview = async (reviewData: ReviewInsert) => {
  const { data, error } = await supabase
    .from('reviews')
    .insert(reviewData)
    .select()
    .single();
  
  if (error) {
    console.error("Error creating review:", error);
    throw error;
  }
  
  return data;
};

/**
 * Get a review by ID
 */
export const getReviewById = async (reviewId: string) => {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      profiles:customer_id (*),
      business_profiles:business_id (
        *,
        business_info (*)
      ),
      responses (*)
    `)
    .eq('id', reviewId)
    .single();
  
  if (error) {
    console.error("Error fetching review:", error);
    throw error;
  }
  
  return data;
};

/**
 * Get responses for a review
 */
export const getReviewResponses = async (reviewId: string) => {
  const { data, error } = await supabase
    .from('responses')
    .select('*')
    .eq('review_id', reviewId)
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error("Error fetching review responses:", error);
    throw error;
  }
  
  return data;
};

/**
 * Add a response to a review
 */
export const addReviewResponse = async (responseData: ResponseInsert) => {
  const { data, error } = await supabase
    .from('responses')
    .insert(responseData)
    .select()
    .single();
  
  if (error) {
    console.error("Error adding review response:", error);
    throw error;
  }
  
  return data;
};

/**
 * Update a response
 */
export const updateReviewResponse = async (responseId: string, content: string) => {
  const { data, error } = await supabase
    .from('responses')
    .update({ content, updated_at: new Date().toISOString() })
    .eq('id', responseId)
    .select()
    .single();
  
  if (error) {
    console.error("Error updating review response:", error);
    throw error;
  }
  
  return data;
};

/**
 * Delete a response
 */
export const deleteReviewResponse = async (responseId: string) => {
  const { error } = await supabase
    .from('responses')
    .delete()
    .eq('id', responseId);
  
  if (error) {
    console.error("Error deleting review response:", error);
    throw error;
  }
  
  return true;
};

/**
 * Add a reaction to a review
 */
export const addReviewReaction = async (reviewId: string, userId: string, reactionType: string) => {
  // Since we don't have a review_reactions table in Supabase yet,
  // we'll implement a mock version for now that returns immediately
  console.log(`Mock: Adding reaction ${reactionType} to review ${reviewId} by user ${userId}`);
  
  // Mock successful addition
  return true;
};

/**
 * Get all reactions for a review
 */
export const getReviewReactions = async (reviewId: string) => {
  // Since we don't have a review_reactions table in Supabase yet,
  // we'll return mock data
  console.log(`Mock: Getting reactions for review ${reviewId}`);
  
  // Format reactions by type
  const formattedReactions = {
    like: [] as string[],
    funny: [] as string[],
    useful: [] as string[],
    ohNo: [] as string[]
  };
  
  return formattedReactions;
};

/**
 * Search for reviews by business name, customer name, or content
 */
export const searchReviews = async (query: string) => {
  if (!query) return [];
  
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      customer:customer_id (first_name, last_name),
      business:business_id (
        *,
        business_info (business_name)
      )
    `)
    .or(`content.ilike.%${query}%,customer.first_name.ilike.%${query}%,customer.last_name.ilike.%${query}%,business.business_info.business_name.ilike.%${query}%`)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error("Error searching reviews:", error);
    throw error;
  }
  
  return data;
};
