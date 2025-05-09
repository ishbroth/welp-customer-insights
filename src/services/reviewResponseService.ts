
import { supabase } from "@/integrations/supabase/client";
import { ReviewResponse } from "@/types/supabase";

// Add a response to a review
export const addReviewResponse = async (responseData: Partial<ReviewResponse>) => {
  try {
    // Make sure required fields are present
    if (!responseData.review_id || !responseData.author_id || !responseData.content) {
      throw new Error("Missing required response data");
    }

    // Create a properly typed object for insertion
    const dataToInsert = {
      review_id: responseData.review_id,
      author_id: responseData.author_id,
      content: responseData.content,
      parent_id: responseData.parent_id
    };

    const { data, error } = await supabase
      .from('review_responses')
      .insert(dataToInsert)
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

// Update a response
export const updateReviewResponse = async (responseId: string, content: string) => {
  try {
    const { data, error } = await supabase
      .from('review_responses')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', responseId)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error: any) {
    console.error('Error updating response:', error.message);
    throw error;
  }
};

// Delete a response
export const deleteReviewResponse = async (responseId: string) => {
  try {
    const { error } = await supabase
      .from('review_responses')
      .delete()
      .eq('id', responseId);

    if (error) {
      throw error;
    }

    return true;
  } catch (error: any) {
    console.error('Error deleting response:', error.message);
    throw error;
  }
};
