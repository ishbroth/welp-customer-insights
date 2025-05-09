
import { supabase } from "@/integrations/supabase/client";
import { ReviewReaction } from "@/types/supabase";

// Add a reaction to a review
export const addReaction = async (reviewId: string, userId: string, reactionType: string) => {
  try {
    const { data, error } = await supabase
      .from('review_reactions')
      .insert({
        review_id: reviewId, 
        user_id: userId, 
        reaction_type: reactionType
      })
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
