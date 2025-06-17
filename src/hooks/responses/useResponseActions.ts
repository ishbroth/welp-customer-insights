
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { Response } from "./types";

export const useResponseActions = (reviewId: string, hasSubscription: boolean) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitResponse = async (responseContent: string): Promise<boolean> => {
    if (!currentUser || !hasSubscription || !responseContent.trim()) {
      return false;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('responses')
        .insert({
          review_id: reviewId,
          content: responseContent.trim(),
          author_id: currentUser.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Response submitted",
        description: "Your response has been added successfully!"
      });

      return true;
    } catch (error) {
      console.error('Error submitting response:', error);
      toast({
        title: "Error",
        description: "Failed to submit response. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateResponse = async (responseId: string, content: string): Promise<boolean> => {
    if (!currentUser) return false;

    try {
      const { error } = await supabase
        .from('responses')
        .update({ content })
        .eq('id', responseId)
        .eq('author_id', currentUser.id);

      if (error) throw error;

      toast({
        title: "Response updated",
        description: "Your response has been updated successfully!"
      });

      return true;
    } catch (error) {
      console.error('Error updating response:', error);
      toast({
        title: "Error",
        description: "Failed to update response. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const handleDeleteResponse = async (responseId: string): Promise<boolean> => {
    if (!currentUser) return false;

    try {
      const { error } = await supabase
        .from('responses')
        .delete()
        .eq('id', responseId)
        .eq('author_id', currentUser.id);

      if (error) throw error;

      toast({
        title: "Response deleted",
        description: "Your response has been deleted successfully!"
      });

      return true;
    } catch (error) {
      console.error('Error deleting response:', error);
      toast({
        title: "Error",
        description: "Failed to delete response. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    isSubmitting,
    handleSubmitResponse,
    handleUpdateResponse,
    handleDeleteResponse
  };
};
