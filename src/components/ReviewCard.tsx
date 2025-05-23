import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { formatDistance } from "date-fns";
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

// Import our new components
import ReviewHeader from "./review/ReviewHeader";
import ReviewResponseForm from "./review/ReviewResponseForm";
import ReviewResponses from "./review/ReviewResponses";

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
        authorName: currentUser?.name || "Business Owner",
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
      authorName: currentUser?.name || "Business Owner",
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
        {/* Review Header */}
        <ReviewHeader 
          businessName={review.businessName}
          rating={review.rating}
          location={formattedLocation()}
        />
        
        {/* Review Content */}
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
        
        {/* Review Responses Section */}
        <ReviewResponses
          responses={responses}
          currentUserId={currentUser?.id}
          hasSubscription={hasSubscription}
          showResponse={showResponse}
          isResponseVisible={isResponseVisible}
          setIsResponseVisible={setIsResponseVisible}
          editResponseId={editResponseId}
          editContent={editContent}
          setEditContent={setEditContent}
          handleSaveEdit={handleSaveEdit}
          handleCancelEdit={handleCancelEdit}
          replyToResponseId={replyToResponseId}
          setReplyToResponseId={setReplyToResponseId}
          replyContent={replyContent}
          setReplyContent={setReplyContent}
          handleSubmitReply={handleSubmitReply}
          canBusinessRespond={canBusinessRespond}
          handleEditResponse={handleEditResponse}
          setResponseToDeleteId={setResponseToDeleteId}
          setDeleteDialogOpen={setDeleteDialogOpen}
        />
        
        {/* Response Form */}
        {isResponseVisible && hasSubscription && (
          <ReviewResponseForm
            response={response}
            setResponse={setResponse}
            handleSubmitResponse={handleSubmitResponse}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
      
      {/* Add Content Rejection Dialog */}
      <ContentRejectionDialog 
        open={showRejectionDialog}
        onOpenChange={setShowRejectionDialog}
        reason={rejectionReason || ""}
        onClose={() => setShowRejectionDialog(false)}
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
