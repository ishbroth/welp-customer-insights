
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import StarRating from "./StarRating";
import { formatDistance } from "date-fns";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Edit, Trash2, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { moderateContent } from "@/utils/contentModeration";
import ContentRejectionDialog from "@/components/moderation/ContentRejectionDialog";
import { supabase, createResponse, updateResponse, deleteResponse } from "@/lib/supabase";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ReviewResponse {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  replies?: ReviewResponse[];
}

interface ReviewCardProps {
  review: {
    id: string;
    businessName: string;
    businessId: string;
    customerName: string;
    customerId?: string;
    rating: number;
    comment: string;
    createdAt: string;
    location: string;
    address?: string;
    city?: string;
    zipCode?: string;
    responses?: ReviewResponse[];
  };
  showResponse?: boolean;
  hasSubscription?: boolean;
}

const ReviewCard = ({ review, showResponse = false, hasSubscription = false }: ReviewCardProps) => {
  const [isResponseVisible, setIsResponseVisible] = useState(false);
  const [response, setResponse] = useState("");
  const [responses, setResponses] = useState<ReviewResponse[]>(review.responses || []);
  const [replyToResponseId, setReplyToResponseId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [editResponseId, setEditResponseId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [responseToDeleteId, setResponseToDeleteId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Ensure hasSubscription is properly used throughout the component
  const canRespond = showResponse && hasSubscription;

  // Check if the business owner can respond based on who sent the last message
  const canBusinessRespond = () => {
    if (!currentUser || !responses.length) return true;
    
    // Sort responses by creation date (newest first)
    const sortedResponses = [...responses].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    // Get the most recent response
    const lastResponse = sortedResponses[0];
    
    // If the last response is from the business owner, they cannot respond again
    // until the customer responds
    return lastResponse.authorId !== currentUser.id;
  };

  // Find business owner responses in the review
  const businessResponses = responses.filter(resp => 
    resp.authorId === currentUser?.id
  );

  // Create response mutation
  const createResponseMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!currentUser?.id) throw new Error("User not authenticated");
      
      const result = await createResponse({
        review_id: review.id,
        content: content
      });
      
      return {
        id: result.id,
        authorId: currentUser.id,
        authorName: currentUser.name || "Business Owner",
        content: content,
        createdAt: result.created_at
      };
    },
    onSuccess: (newResponse) => {
      setResponses(prev => [...prev, newResponse]);
      setResponse("");
      setIsResponseVisible(false);
      
      toast({
        title: "Response submitted",
        description: "Your response has been added successfully!"
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['businessReviews'] });
    },
    onError: (error) => {
      console.error("Error creating response:", error);
      toast({
        title: "Error",
        description: "Failed to submit response. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Update response mutation
  const updateResponseMutation = useMutation({
    mutationFn: async ({ responseId, content }: { responseId: string, content: string }) => {
      const result = await updateResponse(responseId, { content });
      
      return {
        id: responseId,
        content: content,
        createdAt: result.updated_at
      };
    },
    onSuccess: (updatedResponse) => {
      setResponses(prev => prev.map(resp => {
        if (resp.id === updatedResponse.id) {
          return { ...resp, content: updatedResponse.content, createdAt: updatedResponse.createdAt };
        }
        return resp;
      }));
      
      setEditResponseId(null);
      setEditContent("");
      
      toast({
        title: "Response updated",
        description: "Your response has been updated successfully!"
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['businessReviews'] });
    },
    onError: (error) => {
      console.error("Error updating response:", error);
      toast({
        title: "Error",
        description: "Failed to update response. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Delete response mutation
  const deleteResponseMutation = useMutation({
    mutationFn: async (responseId: string) => {
      await deleteResponse(responseId);
      return responseId;
    },
    onSuccess: (deletedResponseId) => {
      setResponses(prev => prev.filter(resp => resp.id !== deletedResponseId));
      setResponseToDeleteId(null);
      setDeleteDialogOpen(false);
      
      toast({
        title: "Response deleted",
        description: "Your response has been deleted successfully!"
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['businessReviews'] });
    },
    onError: (error) => {
      console.error("Error deleting response:", error);
      toast({
        title: "Error",
        description: "Failed to delete response. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSubmitResponse = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canRespond) {
      toast({
        title: "Subscription required",
        description: "You need an active subscription to respond to reviews.",
        variant: "destructive"
      });
      return;
    }
    
    if (!response.trim()) {
      toast({
        title: "Empty response",
        description: "Please write something before submitting.",
        variant: "destructive"
      });
      return;
    }
    
    // Add content moderation check
    const moderationResult = moderateContent(response);
    if (!moderationResult.isApproved) {
      setRejectionReason(moderationResult.reason || "Your content violates our guidelines.");
      setShowRejectionDialog(true);
      return;
    }
    
    createResponseMutation.mutate(response);
  };

  // Function to handle editing a response
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

  // Function to save an edited response
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

    // Add content moderation check
    const moderationResult = moderateContent(editContent);
    if (!moderationResult.isApproved) {
      setRejectionReason(moderationResult.reason || "Your content violates our guidelines.");
      setShowRejectionDialog(true);
      return;
    }

    updateResponseMutation.mutate({ responseId: editResponseId, content: editContent });
  };

  // Function to cancel editing
  const handleCancelEdit = () => {
    setEditResponseId(null);
    setEditContent("");
  };

  // Function to confirm delete
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
    
    deleteResponseMutation.mutate(responseToDeleteId);
  };

  // Format the location info including business address when available
  const formattedLocation = () => {
    const locationParts = [];
    
    // Add address if available
    if (review.address) {
      locationParts.push(review.address);
    }
    
    // Add city if available
    if (review.city) {
      locationParts.push(review.city);
    }
    
    // If we have address or city info, use it; otherwise fall back to the location property
    return locationParts.length > 0 ? locationParts.join(", ") : review.location;
  };

  return (
    <Card className="mb-4 overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <div className="font-bold text-lg">{review.businessName}</div>
            <StarRating rating={review.rating} size="md" />
          </div>
          <div className="text-sm text-gray-500">{formattedLocation()}</div>
        </div>
        
        <div className="mb-4">
          <p className="text-gray-700 whitespace-pre-line">{review.comment}</p>
        </div>
        
        <div className="text-sm text-gray-500">
          <span>
            {formatDistance(new Date(review.createdAt), new Date(), {
              addSuffix: true,
            })}
          </span>
        </div>
        
        {/* Display existing responses with ability to edit/delete */}
        {responses.length > 0 && (
          <div className="mt-4 border-t pt-4">
            <h4 className="text-md font-semibold mb-3">Responses</h4>
            {responses.map((resp) => (
              <div key={resp.id} className="bg-gray-50 p-3 rounded-md mb-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{resp.authorName}</span>
                  <span className="text-xs text-gray-500">
                    {formatDistance(new Date(resp.createdAt), new Date(), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                
                {/* If in edit mode for this response, show edit form */}
                {editResponseId === resp.id ? (
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
                        disabled={updateResponseMutation.isPending}
                      >
                        {updateResponseMutation.isPending ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-700 text-sm whitespace-pre-line">{resp.content}</p>
                )}
                
                {/* Show edit/delete buttons for business owner's own responses */}
                {resp.authorId === currentUser?.id && editResponseId !== resp.id && (
                  <div className="mt-2 flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-600 hover:bg-gray-100 h-8 px-2 py-1"
                      onClick={() => handleEditResponse(resp.id)}
                      disabled={!hasSubscription}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      {hasSubscription ? 'Edit' : <Lock className="h-3 w-3" />}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-600 hover:bg-red-50 hover:text-red-700 h-8 px-2 py-1"
                      onClick={() => {
                        if (hasSubscription) {
                          setResponseToDeleteId(resp.id);
                          setDeleteDialogOpen(true);
                        } else {
                          toast({
                            title: "Subscription required",
                            description: "You need an active subscription to delete responses.",
                            variant: "destructive"
                          });
                        }
                      }}
                      disabled={!hasSubscription}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      {hasSubscription ? 'Delete' : <Lock className="h-3 w-3" />}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Show different UI based on subscription status AND who sent the last message */}
        {showResponse ? (
          hasSubscription ? (
            /* If user has subscription, show respond button when appropriate */
            canBusinessRespond() && (
              <div className="mt-4 flex justify-end">
                <Button 
                  onClick={() => setIsResponseVisible(!isResponseVisible)}
                >
                  {isResponseVisible ? "Cancel" : "Respond"}
                </Button>
              </div>
            )
          ) : (
            /* If user doesn't have subscription, show link to subscription page */
            <div className="mt-4 flex justify-end">
              <Button 
                variant="outline"
                asChild
                className="flex items-center gap-1 text-sm"
              >
                <Link to="/subscription">
                  <Lock className="h-4 w-4 mr-1" />
                  Subscribe to respond
                </Link>
              </Button>
            </div>
          )
        ) : null}
        
        {/* Response form - only shown when clicked respond and has subscription */}
        {isResponseVisible && hasSubscription && (
          <form onSubmit={handleSubmitResponse} className="mt-4 border-t pt-4">
            <Textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Write your response to this review..."
              className="w-full p-3 border rounded-md min-h-[100px] focus:ring-2 focus:ring-welp-primary focus:border-transparent"
              maxLength={1500}
              required
            />
            <div className="flex justify-between items-center mt-2">
              <div className="text-xs text-gray-500">
                {response.length}/1500 characters
              </div>
              <Button 
                type="submit" 
                className="welp-button" 
                disabled={createResponseMutation.isPending}
              >
                {createResponseMutation.isPending ? "Submitting..." : "Submit Response"}
              </Button>
            </div>
          </form>
        )}
      </div>
      
      {/* Content Rejection Dialog */}
      <ContentRejectionDialog 
        open={showRejectionDialog}
        onOpenChange={setShowRejectionDialog}
        reason={rejectionReason || ""}
      />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Response</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this response? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteResponse}
              className="bg-red-500 text-white hover:bg-red-600"
              disabled={deleteResponseMutation.isPending}
            >
              {deleteResponseMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default ReviewCard;
