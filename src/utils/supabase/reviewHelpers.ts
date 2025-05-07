
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
  // First check if reaction exists
  const { data: existingReaction } = await supabase
    .from('review_reactions')
    .select('*')
    .eq('review_id', reviewId)
    .eq('user_id', userId)
    .eq('reaction_type', reactionType)
    .single();
  
  if (existingReaction) {
    // If reaction exists, remove it (toggle off)
    const { error } = await supabase
      .from('review_reactions')
      .delete()
      .eq('id', existingReaction.id);
    
    if (error) {
      console.error("Error removing review reaction:", error);
      throw error;
    }
    
    return false; // Reaction removed
  } else {
    // Add new reaction
    const { error } = await supabase
      .from('review_reactions')
      .insert({
        review_id: reviewId,
        user_id: userId,
        reaction_type: reactionType
      });
    
    if (error) {
      console.error("Error adding review reaction:", error);
      throw error;
    }
    
    return true; // Reaction added
  }
};

/**
 * Get all reactions for a review
 */
export const getReviewReactions = async (reviewId: string) => {
  const { data, error } = await supabase
    .from('review_reactions')
    .select('*')
    .eq('review_id', reviewId);
  
  if (error) {
    console.error("Error fetching review reactions:", error);
    throw error;
  }
  
  // Format reactions by type
  const formattedReactions = {
    like: [] as string[],
    funny: [] as string[],
    useful: [] as string[],
    ohNo: [] as string[]
  };
  
  data.forEach(reaction => {
    if (['like', 'funny', 'useful', 'ohNo'].includes(reaction.reaction_type)) {
      formattedReactions[reaction.reaction_type as keyof typeof formattedReactions].push(reaction.user_id);
    }
  });
  
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
