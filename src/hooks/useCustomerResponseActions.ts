
import { useState } from "react";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Response {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export const useCustomerResponseActions = (
  reviewId: string,
  responses: Response[],
  setResponses: React.Dispatch<React.SetStateAction<Response[]>>
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingResponseId, setEditingResponseId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const handleSubmitResponse = async (responseText: string) => {
    if (responseText === "") {
      return;
    }

    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to respond.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Use the existing responses table
      const { data, error } = await supabase
        .from('responses')
        .insert({
          review_id: reviewId,
          content: responseText
        })
        .select()
        .single();

      if (error) throw error;

      const newResponse: Response = {
        id: data?.id || `temp-${Date.now()}`,
        authorId: currentUser.id,
        authorName: currentUser.name || 'Customer',
        content: responseText,
        createdAt: new Date().toISOString()
      };

      setResponses(prev => [...prev, newResponse]);

      toast({
        title: "Response submitted",
        description: "Your response has been added successfully!"
      });
    } catch (error) {
      console.error('Error submitting response:', error);
      toast({
        title: "Error",
        description: "Failed to submit response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditResponse = () => {
    if (!currentUser) return;

    const userResponse = responses.find(r => r.authorId === currentUser.id);
    if (userResponse) {
      setEditingResponseId(userResponse.id);
      setEditContent(userResponse.content);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingResponseId || !currentUser) return;

    try {
      const { error } = await supabase
        .from('responses')
        .update({ content: editContent })
        .eq('id', editingResponseId);

      if (error) throw error;

      setResponses(prev => prev.map(response =>
        response.id === editingResponseId
          ? { ...response, content: editContent }
          : response
      ));

      setEditingResponseId(null);
      setEditContent("");

      toast({
        title: "Response updated",
        description: "Your response has been updated successfully!"
      });
    } catch (error) {
      console.error('Error updating response:', error);
      toast({
        title: "Error",
        description: "Failed to update response. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingResponseId(null);
    setEditContent("");
  };

  const handleDeleteResponse = async () => {
    if (!currentUser) return;

    const userResponseId = responses.find(r => r.authorId === currentUser.id)?.id;
    if (!userResponseId) return;

    try {
      const { error } = await supabase
        .from('responses')
        .delete()
        .eq('id', userResponseId);

      if (error) throw error;

      setResponses(prev => prev.filter(response => response.id !== userResponseId));

      toast({
        title: "Response deleted",
        description: "Your response has been deleted successfully!"
      });
    } catch (error) {
      console.error('Error deleting response:', error);
      toast({
        title: "Error",
        description: "Failed to delete response. Please try again.",
        variant: "destructive"
      });
    }
  };

  return {
    isSubmitting,
    editingResponseId,
    editContent,
    setEditContent,
    handleSubmitResponse,
    handleEditResponse,
    handleSaveEdit,
    handleCancelEdit,
    handleDeleteResponse
  };
};
