
import React, { useState } from "react";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ResponseDeleteDialog from "@/components/response/ResponseDeleteDialog";
import { useConversationFlow } from "@/hooks/responses/useConversationFlow";
import ResponseForm from "./responses/ResponseForm";
import ResponseList from "./responses/ResponseList";
import { useResponsePermissions } from "./responses/useResponsePermissions";

interface Response {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

interface CustomerReviewResponseProps {
  reviewId: string;
  responses: Response[];
  hasSubscription: boolean;
  isOneTimeUnlocked: boolean;
  hideReplyOption: boolean;
  reviewAuthorId?: string;
  customerId?: string;
  onResponseSubmitted?: (response: Response) => void;
  onSubmitResponse?: (content: string) => Promise<boolean>;
  onDeleteResponse?: (responseId: string) => void;
}

const CustomerReviewResponse: React.FC<CustomerReviewResponseProps> = ({
  reviewId,
  responses,
  hasSubscription,
  isOneTimeUnlocked,
  hideReplyOption,
  reviewAuthorId,
  customerId,
  onResponseSubmitted,
  onSubmitResponse,
  onDeleteResponse,
}) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editResponseId, setEditResponseId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [responseToDelete, setResponseToDelete] = useState<string | null>(null);

  // FIXED: Pass the actual customerId instead of undefined
  const { canRespond, isMyTurn } = useConversationFlow({
    responses,
    customerId: customerId || currentUser?.id, // Use current user ID if customerId not provided
    reviewerId: reviewAuthorId
  });

  // Use response permissions hook
  const { canUserRespond } = useResponsePermissions({
    hasSubscription,
    isOneTimeUnlocked,
    reviewAuthorId
  });

  console.log('CustomerReviewResponse conversation status:', {
    reviewId,
    currentUserId: currentUser?.id,
    customerId: customerId || currentUser?.id,
    reviewAuthorId,
    responsesCount: responses.length,
    canRespond: canRespond,
    isMyTurn: isMyTurn,
    lastResponseBy: responses.length > 0 ? responses[responses.length - 1]?.authorId : 'none'
  });

  const handleSubmitResponse = async (responseText: string) => {
    // Check conversation flow first
    if (!canRespond || !isMyTurn) {
      toast({
        title: "Not your turn",
        description: "Please wait for the other party to respond first.",
        variant: "destructive"
      });
      return;
    }

    // Enhanced permission check for responses
    if (!canUserRespond()) {
      if (!currentUser) {
        toast({
          title: "Login required",
          description: "You need to be logged in to respond to reviews.",
          variant: "destructive"
        });
      } else if (!hasSubscription && !isOneTimeUnlocked) {
        toast({
          title: "Subscription or access required",
          description: "You need an active subscription or one-time access to respond to reviews.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Not allowed",
          description: "You don't have permission to respond to this review.",
          variant: "destructive"
        });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      // Use the provided onSubmitResponse if available, otherwise fall back to default
      if (onSubmitResponse) {
        const success = await onSubmitResponse(responseText);
        if (!success) {
          throw new Error("Failed to submit response");
        }
      } else {
        const { data, error } = await supabase
          .from('responses')
          .insert({
            review_id: reviewId,
            content: responseText,
            author_id: currentUser!.id
          })
          .select()
          .single();

        if (error) throw error;

        const newResponse: Response = {
          id: data.id,
          authorId: currentUser!.id,
          authorName: currentUser!.name || 'User',
          content: responseText,
          createdAt: new Date().toISOString()
        };

        if (onResponseSubmitted) {
          onResponseSubmitted(newResponse);
        }

        toast({
          title: "Response submitted",
          description: "Your response has been added successfully!"
        });
      }
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

  const handleEditStart = (responseId: string, content: string) => {
    const response = responses.find(r => r.id === responseId);
    if (response && response.authorId === currentUser?.id) {
      setEditResponseId(responseId);
      setEditContent(content);
    }
  };

  const handleSaveEdit = async () => {
    if (!editResponseId || !currentUser) return;

    try {
      const { error } = await supabase
        .from('responses')
        .update({ content: editContent })
        .eq('id', editResponseId)
        .eq('author_id', currentUser.id);

      if (error) throw error;

      // Update the response in the list
      if (onResponseSubmitted) {
        const updatedResponse = responses.find(r => r.id === editResponseId);
        if (updatedResponse) {
          onResponseSubmitted({
            ...updatedResponse,
            content: editContent
          });
        }
      }

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

  const handleDeleteClick = (responseId: string) => {
    setResponseToDelete(responseId);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!responseToDelete || !currentUser) return;

    try {
      // Use the provided onDeleteResponse if available, otherwise fall back to default
      if (onDeleteResponse) {
        onDeleteResponse(responseToDelete);
      } else {
        const { error } = await supabase
          .from('responses')
          .delete()
          .eq('id', responseToDelete)
          .eq('author_id', currentUser.id);

        if (error) throw error;

        // Refresh the page or update the responses list
        window.location.reload();
      }

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
    } finally {
      setShowDeleteDialog(false);
      setResponseToDelete(null);
    }
  };

  // Only show response form if it's the user's turn and they have permission
  const shouldShowResponseForm = canRespond && isMyTurn && canUserRespond() && !hideReplyOption;

  return (
    <div className="mt-4">
      <ResponseList
        responses={responses}
        currentUserId={currentUser?.id}
        hasSubscription={hasSubscription}
        editResponseId={editResponseId}
        editContent={editContent}
        onEditStart={handleEditStart}
        onEditSave={handleSaveEdit}
        onEditCancel={handleCancelEdit}
        onEditContentChange={setEditContent}
        onDelete={handleDeleteClick}
      />

      <ResponseForm
        onSubmit={handleSubmitResponse}
        isSubmitting={isSubmitting}
        canSubmit={shouldShowResponseForm}
      />

      <ResponseDeleteDialog 
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default CustomerReviewResponse;
