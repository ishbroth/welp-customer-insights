
import { useState } from "react";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ReviewResponse {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  replies?: ReviewResponse[];
}

export const useReviewResponseActions = (
  reviewId: string,
  responses: ReviewResponse[],
  setResponses: React.Dispatch<React.SetStateAction<ReviewResponse[]>>,
  hasSubscription: boolean
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editResponseId, setEditResponseId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [replyToResponseId, setReplyToResponseId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [responseToDeleteId, setResponseToDeleteId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);

  const { currentUser } = useAuth();
  const { toast } = useToast();

  const handleSubmitResponse = async (responseText: string) => {
    if (!currentUser || !hasSubscription) {
      toast({
        title: "Subscription required",
        description: "You need an active subscription to respond to reviews.",
        variant: "destructive"
      });
      return;
    }

    if (!responseText.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('responses')
        .insert({
          review_id: reviewId,
          content: responseText,
          author_id: currentUser.id
        })
        .select()
        .single();

      if (error) throw error;

      const newResponse: ReviewResponse = {
        id: data.id,
        authorId: currentUser.id,
        authorName: currentUser.name || 'User',
        content: responseText,
        createdAt: new Date().toISOString(),
        replies: []
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

  const handleEditResponse = (responseId: string) => {
    const response = responses.find(r => r.id === responseId);
    if (response && response.authorId === currentUser?.id) {
      setEditResponseId(responseId);
      setEditContent(response.content);
    }
  };

  const handleSaveEdit = async () => {
    if (!editResponseId || !currentUser) return;

    try {
      const { error } = await supabase
        .from('responses')
        .update({ content: editContent })
        .eq('id', editResponseId);

      if (error) throw error;

      setResponses(prev => prev.map(response =>
        response.id === editResponseId
          ? { ...response, content: editContent }
          : response
      ));

      setEditResponseId(null);
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
    setEditResponseId(null);
    setEditContent("");
  };

  const handleDeleteResponse = async () => {
    if (!responseToDeleteId || !currentUser) return;

    try {
      const { error } = await supabase
        .from('responses')
        .delete()
        .eq('id', responseToDeleteId);

      if (error) throw error;

      setResponses(prev => prev.filter(response => response.id !== responseToDeleteId));
      setDeleteDialogOpen(false);
      setResponseToDeleteId(null);

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

  const handleSubmitReply = async (responseId: string) => {
    // Implementation for replies would go here
    console.log('Submit reply to:', responseId, 'Content:', replyContent);
    setReplyToResponseId(null);
    setReplyContent("");
  };

  return {
    isSubmitting,
    editResponseId,
    editContent,
    setEditContent,
    replyToResponseId,
    setReplyToResponseId,
    replyContent,
    setReplyContent,
    deleteDialogOpen,
    setDeleteDialogOpen,
    responseToDeleteId,
    rejectionReason,
    showRejectionDialog,
    setShowRejectionDialog,
    handleSubmitResponse,
    handleEditResponse,
    handleSaveEdit,
    handleCancelEdit,
    handleDeleteResponse,
    handleSubmitReply
  };
};
