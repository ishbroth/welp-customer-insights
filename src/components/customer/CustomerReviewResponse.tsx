
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Trash2, Lock } from "lucide-react";
import { formatDistance } from "date-fns";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ResponseDeleteDialog from "@/components/response/ResponseDeleteDialog";

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
  onResponseSubmitted?: (response: Response) => void;
}

const CustomerReviewResponse: React.FC<CustomerReviewResponseProps> = ({
  reviewId,
  responses,
  hasSubscription,
  isOneTimeUnlocked,
  hideReplyOption,
  reviewAuthorId,
  onResponseSubmitted,
}) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [responseText, setResponseText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editResponseId, setEditResponseId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [responseToDelete, setResponseToDelete] = useState<string | null>(null);

  console.log('CustomerReviewResponse rendering review', reviewId, 'with valid responses:', responses);

  const handleSubmitResponse = async () => {
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

      const newResponse: Response = {
        id: data.id,
        authorId: currentUser.id,
        authorName: currentUser.name || 'User',
        content: responseText,
        createdAt: new Date().toISOString()
      };

      if (onResponseSubmitted) {
        onResponseSubmitted(newResponse);
      }

      setResponseText("");

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

  // Enhanced permission check for who can respond
  const canUserRespond = (): boolean => {
    if (!currentUser) return false;
    
    const isCustomerUser = currentUser.type === "customer";
    const isBusinessUser = currentUser.type === "business";
    
    // For customer users: they need subscription or one-time access
    if (isCustomerUser) {
      return hasSubscription || isOneTimeUnlocked;
    }
    
    // For business users: they need subscription or one-time access, and cannot respond to their own reviews
    if (isBusinessUser) {
      const isReviewAuthor = currentUser.id === reviewAuthorId;
      if (isReviewAuthor) return false;
      return hasSubscription || isOneTimeUnlocked;
    }
    
    return false;
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
      const { error } = await supabase
        .from('responses')
        .delete()
        .eq('id', responseToDelete)
        .eq('author_id', currentUser.id);

      if (error) throw error;

      // Refresh the page or update the responses list
      window.location.reload();

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

  const canRespond = canUserRespond() && !hideReplyOption;

  return (
    <div className="mt-4">
      {responses.length > 0 && (
        <div className="space-y-3 mb-4">
          <h4 className="font-medium text-gray-900">Responses:</h4>
          {responses.map((response) => (
            <div key={response.id} className="bg-gray-50 p-3 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-sm">{response.authorName}</span>
                <span className="text-xs text-gray-500">
                  {formatDistance(new Date(response.createdAt), new Date(), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              
              {editResponseId === response.id ? (
                <div>
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-2 text-sm min-h-[80px] mb-2"
                    maxLength={1500}
                  />
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleSaveEdit}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-gray-700 text-sm whitespace-pre-line">{response.content}</p>
                  
                  {/* Show edit/delete buttons for user's own responses */}
                  {response.authorId === currentUser?.id && editResponseId !== response.id && (
                    <div className="mt-2 flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-gray-600 hover:bg-gray-100 h-8 px-2 py-1"
                        onClick={() => handleEditResponse(response.id)}
                        disabled={!hasSubscription}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        {hasSubscription ? 'Edit' : <Lock className="h-3 w-3" />}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 hover:bg-red-50 hover:text-red-700 h-8 px-2 py-1"
                        onClick={() => handleDeleteClick(response.id)}
                        disabled={!hasSubscription}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        {hasSubscription ? 'Delete' : <Lock className="h-3 w-3" />}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {canRespond && (
        <div className="border-t pt-4">
          <Textarea
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            placeholder="Write your response..."
            className="w-full mb-3 min-h-[100px]"
            maxLength={1500}
          />
          <div className="flex justify-end">
            <Button 
              onClick={handleSubmitResponse}
              disabled={isSubmitting || !responseText.trim()}
              className="px-6"
            >
              {isSubmitting ? "Submitting..." : "Submit Response"}
            </Button>
          </div>
        </div>
      )}

      <ResponseDeleteDialog 
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default CustomerReviewResponse;
