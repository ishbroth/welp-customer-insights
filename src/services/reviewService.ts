
import { supabase } from "@/integrations/supabase/client";
import { Review, ReviewReaction, ReviewResponse, SearchableCustomer } from "@/types/supabase";
import { useToast } from "@/hooks/use-toast";

// Create a new customer in the searchable_customers table
export const createSearchableCustomer = async (customerData: Partial<SearchableCustomer>) => {
  try {
    const { data, error } = await supabase
      .from('searchable_customers')
      .insert([customerData])
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error: any) {
    console.error('Error creating searchable customer:', error.message);
    throw error;
  }
};

// Search for customers by various criteria
export const searchCustomers = async (searchParams: {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  fuzzyMatch?: boolean;
}) => {
  try {
    let query = supabase.from('searchable_customers').select('*');

    if (searchParams.lastName) {
      query = query.ilike('last_name', `%${searchParams.lastName}%`);
    }
    
    if (searchParams.firstName) {
      query = query.ilike('first_name', `%${searchParams.firstName}%`);
    }
    
    if (searchParams.phone) {
      query = query.ilike('phone', `%${searchParams.phone}%`);
    }
    
    if (searchParams.address) {
      query = query.ilike('address', `%${searchParams.address}%`);
    }
    
    if (searchParams.city) {
      query = query.ilike('city', `%${searchParams.city}%`);
    }
    
    if (searchParams.state) {
      query = query.ilike('state', `%${searchParams.state}%`);
    }
    
    if (searchParams.zipCode) {
      query = query.ilike('zip_code', `%${searchParams.zipCode}%`);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data;
  } catch (error: any) {
    console.error('Error searching customers:', error.message);
    throw error;
  }
};

// Create a new review
export const createReview = async (reviewData: Partial<Review>) => {
  try {
    // Make sure required fields are present
    if (!reviewData.customer_id || !reviewData.reviewer_id || !reviewData.rating) {
      throw new Error("Missing required review data");
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert(reviewData)  // Remove the array brackets here
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

// Add a reaction to a review
export const addReaction = async (reviewId: string, userId: string, reactionType: string) => {
  try {
    const { data, error } = await supabase
      .from('review_reactions')
      .insert([
        { review_id: reviewId, user_id: userId, reaction_type: reactionType }
      ])
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error: any) {
    console.error('Error adding reaction:', error.message);
    throw error;
  }
};

// Remove a reaction from a review
export const removeReaction = async (reviewId: string, userId: string, reactionType: string) => {
  try {
    const { error } = await supabase
      .from('review_reactions')
      .delete()
      .eq('review_id', reviewId)
      .eq('user_id', userId)
      .eq('reaction_type', reactionType);

    if (error) {
      throw error;
    }

    return true;
  } catch (error: any) {
    console.error('Error removing reaction:', error.message);
    throw error;
  }
};

// Get reactions for a review
export const getReviewReactions = async (reviewId: string) => {
  try {
    const { data, error } = await supabase
      .from('review_reactions')
      .select('*')
      .eq('review_id', reviewId);

    if (error) {
      throw error;
    }

    return data;
  } catch (error: any) {
    console.error('Error getting reactions:', error.message);
    throw error;
  }
};

// Add a response to a review
export const addReviewResponse = async (responseData: Partial<ReviewResponse>) => {
  try {
    // Make sure required fields are present
    if (!responseData.review_id || !responseData.author_id || !responseData.content) {
      throw new Error("Missing required response data");
    }

    const { data, error } = await supabase
      .from('review_responses')
      .insert(responseData)  // Remove the array brackets here
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error: any) {
    console.error('Error adding response:', error.message);
    throw error;
  }
};

// Get responses for a review
export const getReviewResponses = async (reviewId: string) => {
  try {
    const { data, error } = await supabase
      .from('review_responses')
      .select('*')
      .eq('review_id', reviewId)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    return data;
  } catch (error: any) {
    console.error('Error getting responses:', error.message);
    throw error;
  }
};
