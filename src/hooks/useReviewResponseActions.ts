
import { useState } from "react";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { moderateContent } from "@/utils/contentModeration";

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

  const handleSubmitResponse = async (response: string) => {
    if (!hasSubscription) {
      toast({
        title: "Subscription required",
        description: "You need an active subscription to respond to reviews.",
        variant: "destructive"
      });
      return;
    }

    const moderationResult = moderateContent(response);
    if (!moderationResult.isApproved) {
      setRejectionReason(moderationResult.reason || "Your content violates our guidelines.");
      setShowRejectionDialog(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('responses')
        .insert({
          review_id: reviewId,
          content: response
        })
        .select()
        .single();

      if (error) throw error;

      const newResponse: ReviewResponse = {
        id: data?.id || `temp-${Date.now()}`,
        authorId: currentUser?.id || "",
        authorName: currentUser?.name || "Business Owner",
        content: response,
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
    if (!hasSubscription) {
      toast({
        title: "Subscription required",
        description: "You need an active subscription to edit responses.",
        variant: "destructive"
      });
      return;
    }

    const responseToEdit = responses.find(resp => resp.id === responseId);
    if (responseToEdit) {
      setEditResponseId(responseId);
      setEditContent(responseToEdit.content);
    }
  };

  const handleSaveEdit = () => {
    if (!hasSubscription) {
      toast({
        title: "Subscription required",
        description: "You need an active subscription to edit responses.",
        variant: "destructive"
      });
      return;
    }

    if (!editResponseId || !editContent.trim()) {
      toast({
        title: "Empty response",
        description: "Please write something before saving.",
        variant: "destructive"
      });
      return;
    }

    const moderationResult = moderateContent(editContent);
    if (!moderationResult.isApproved) {
      setRejectionReason(moderationResult.reason || "Your content violates our guidelines.");
      setShowRejectionDialog(true);
      return;
    }

    setResponses(prev => prev.map(resp => {
      if (resp.id === editResponseId) {
        return {
          ...resp,
          content: editContent,
          createdAt: new Date().toISOString()
        };
      }
      return resp;
    }));

    setEditResponseId(null);
    setEditContent("");

    toast({
      title: "Response updated",
      description: "Your response has been updated successfully!"
    });
  };

  const handleCancelEdit = () => {
    setEditResponseId(null);
    setEditContent("");
  };

  const handleDeleteResponse = () => {
    if (!hasSubscription) {
      toast({
        title: "Subscription required",
        description: "You need an active subscription to delete responses.",
        variant: "destructive"
      });
      return;
    }

    if (!responseToDeleteId) return;

    setResponses(prev => prev.filter(resp => resp.id !== responseToDeleteId));
    setDeleteDialogOpen(false);
    setResponseToDeleteId(null);

    toast({
      title: "Response deleted",
      description: "Your response has been deleted successfully!"
    });
  };

  const handleSubmitReply = (responseId: string) => {
    if (!hasSubscription) {
      toast({
        title: "Subscription required",
        description: "You need a premium subscription to reply to customers.",
        variant: "destructive"
      });
      return;
    }

    if (!replyContent.trim()) {
      toast({
        title: "Empty reply",
        description: "Please write something before submitting.",
        variant: "destructive"
      });
      return;
    }

    const moderationResult = moderateContent(replyContent);
    if (!moderationResult.isApproved) {
      setRejectionReason(moderationResult.reason || "Your content violates our guidelines.");
      setShowRejectionDialog(true);
      return;
    }

    const newReply = {
      id: `reply-${Date.now()}`,
      authorId: currentUser?.id || "",
      authorName: currentUser?.name || "Business Owner",
      content: replyContent,
      createdAt: new Date().toISOString()
    };

    setResponses(prev => prev.map(resp => {
      if (resp.id === responseId) {
        return {
          ...resp,
          replies: [...(resp.replies || []), newReply]
        };
      }
      return resp;
    }));

    setReplyToResponseId(null);
    setReplyContent("");

    toast({
      title: "Reply submitted",
      description: "Your reply has been added successfully!"
    });
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
    setResponseToDeleteId,
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
