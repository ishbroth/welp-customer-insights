import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import StarRating from "./StarRating";
import { formatDistance } from "date-fns";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Edit, Trash2, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { moderateContent } from "@/utils/contentModeration";
import ContentRejectionDialog from "@/components/moderation/ContentRejectionDialog";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
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
  
  // Get the user's name safely
  const getUserName = () => {
    if (!currentUser) return "User";
    
    if ('name' in currentUser && currentUser.name) {
      return currentUser.name;
    }
    
    // For Supabase users without a name property
    if ('first_name' in currentUser || 'last_name' in currentUser) {
      const firstName = (currentUser as any).first_name || '';
      const lastName = (currentUser as any).last_name || '';
      return `${firstName} ${lastName}`.trim() || (currentUser.email?.split('@')[0] || 'User');
    }
    
    return currentUser.email?.split('@')[0] || 'User';
  };
  
  // Ensure hasSubscription is properly used throughout the component
  const canRespond = showResponse && hasSubscription;

  // Check if the business owner can respond
  const canBusinessRespond = () => {
    if (!currentUser || !responses.length) return true;
    
    // Sort responses by creation date
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

  const handleSubmitResponse = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canRespond) {
      return;
    }
    
    // Add content moderation check
    const moderationResult = moderateContent(response);
    if (!moderationResult.isApproved) {
      setRejectionReason(moderationResult.reason || "Your content violates our guidelines.");
      setShowRejectionDialog(true);
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      // Create new response
      const newResponse = {
        id: `resp-${Date.now()}`,
        authorId: currentUser?.id || "",
        authorName: getUserName(),
        content: response,
        createdAt: new Date().toISOString(),
        replies: []
      };
      
      // Add response to the list
      setResponses(prev => [...prev, newResponse]);
      
      setIsSubmitting(false);
      setIsResponseVisible(false);
      setResponse("");
      
      // Show success toast
      toast({
        title: "Response submitted",
        description: "Your response has been added successfully!"
      });
    }, 1000);
  };

  // Function to handle editing a response
  const handleEditResponse = (responseId: string) => {
    const responseToEdit = responses.find(resp => resp.id === responseId);
    if (responseToEdit) {
      setEditResponseId(responseId);
      setEditContent(responseToEdit.content);
    }
  };

  // Function to save an edited response
  const handleSaveEdit = () => {
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

    setResponses(prev => prev.map(resp => {
      if (resp.id === editResponseId) {
        return {
          ...resp,
          content: editContent,
          createdAt: new Date().toISOString() // Update the timestamp
        };
      }
      return resp;
    }));

    // Reset state
    setEditResponseId(null);
    setEditContent("");

    // Show success toast
    toast({
      title: "Response updated",
      description: "Your response has been updated successfully!"
    });
  };

  // Function to cancel editing
  const handleCancelEdit = () => {
    setEditResponseId(null);
    setEditContent("");
  };

  // Function to confirm delete
  const handleDeleteResponse = () => {
    if (!responseToDeleteId) return;

    setResponses(prev => prev.filter(resp => resp.id !== responseToDeleteId));
    setDeleteDialogOpen(false);
    setResponseToDeleteId(null);

    toast({
      title: "Response deleted",
      description: "Your response has been deleted successfully!"
    });
  };

  // Function to handle replying to a customer response
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

    // Add content moderation check
    const moderationResult = moderateContent(replyContent);
    if (!moderationResult.isApproved) {
      setRejectionReason(moderationResult.reason || "Your content violates our guidelines.");
      setShowRejectionDialog(true);
      return;
    }

    // Create new reply
    const newReply = {
      id: `reply-${Date.now()}`,
      authorId: currentUser?.id || "",
      authorName: getUserName(),
      content: replyContent,
      createdAt: new Date().toISOString()
    };

    // Add reply to the appropriate response
    setResponses(prev => prev.map(resp => {
      if (resp.id === responseId) {
        return {
          ...resp,
          replies: [...(resp.replies || []), newReply]
        };
      }
      return resp;
    }));

    // Reset state
    setReplyToResponseId(null);
    setReplyContent("");

    // Show success toast
    toast({
      title: "Reply submitted",
      description: "Your reply has been added successfully!"
    });
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
                      >
                        Save
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
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-600 hover:bg-red-50 hover:text-red-700 h-8 px-2 py-1"
                      onClick={() => {
                        setResponseToDeleteId(resp.id);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                )}
                
                {/* Display replies to this response */}
                {resp.replies && resp.replies.length > 0 && (
                  <div className="mt-3 pl-4 border-l-2 border-gray-200">
                    {resp.replies.map(reply => (
                      <div key={reply.id} className="bg-white p-2 rounded-md mb-2 border border-gray-100">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-xs">{reply.authorName}</span>
                          <span className="text-xs text-gray-500">
                            {formatDistance(new Date(reply.createdAt), new Date(), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                        <p className="text-gray-700 text-xs">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Show different UI based on subscription status */}
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
                  <Eye className="h-4 w-4 mr-1" />
                  Subscribe to respond
                </Link>
              </Button>
            </div>
          )
        ) : null}
        
        {/* Response form - only shown when clicked respond */}
        {isResponseVisible && (
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
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Response"}
              </Button>
            </div>
          </form>
        )}
      </div>
      
      {/* Add Content Rejection Dialog */}
      <ContentRejectionDialog 
        open={showRejectionDialog}
        onOpenChange={setShowRejectionDialog}
        reason={rejectionReason || ""}
      />
      
      {/* Keep existing delete confirmation dialog */}
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
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default ReviewCard;
