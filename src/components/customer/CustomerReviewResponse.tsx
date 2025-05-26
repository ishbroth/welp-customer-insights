
import { useState } from "react";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import CustomerResponseList from "./CustomerResponseList";
import CustomerResponseForm from "./CustomerResponseForm";
import CustomerResponseActions from "./CustomerResponseActions";

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
  hideReplyOption?: boolean;
  onResponseSubmitted?: (newResponse: Response) => void;
}

const CustomerReviewResponse = ({ 
  reviewId, 
  responses: initialResponses, 
  hasSubscription, 
  isOneTimeUnlocked,
  hideReplyOption = false,
  onResponseSubmitted
}: CustomerReviewResponseProps) => {
  const [isResponseVisible, setIsResponseVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responses, setResponses] = useState<Response[]>(initialResponses);
  const [editingResponseId, setEditingResponseId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const { currentUser, hasOneTimeAccess } = useAuth();
  const { toast } = useToast();
  
  // Use the AuthContext to check if this specific review has one-time access
  const hasReviewAccess = hasOneTimeAccess(reviewId);
  
  // Check if the current user has already responded
  const hasUserResponded = () => {
    if (!currentUser) return false;
    return responses.some(response => response.authorId === currentUser.id);
  };
  
  // Check if the customer can respond based on who sent the last message
  const canCustomerRespond = () => {
    if (!currentUser || !responses.length) return true;
    
    // Sort responses by creation date (newest first)
    const sortedResponses = [...responses].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    // Get the most recent response
    const lastResponse = sortedResponses[0];
    
    // If the last response is from the customer, they cannot respond again
    // until the business responds
    return lastResponse.authorId !== currentUser.id;
  };
  
  const handleSubmitResponse = (responseText: string) => {
    // If empty string is passed, it means cancel was clicked
    if (responseText === "") {
      setIsResponseVisible(false);
      return;
    }
    
    // Check subscription status
    if (!hasSubscription && !isOneTimeUnlocked && !hasReviewAccess) {
      toast({
        title: "Access required",
        description: "You need a subscription or one-time access to respond to reviews.",
        variant: "destructive"
      });
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
    
    // Create new response
    const newResponse: Response = {
      id: `resp-${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name || "Customer",
      content: responseText,
      createdAt: new Date().toISOString()
    };
    
    // Simulate API call with setTimeout
    setTimeout(() => {
      // Update local state
      setResponses(prev => [...prev, newResponse]);
      
      // Notify parent component if callback provided
      if (onResponseSubmitted) {
        onResponseSubmitted(newResponse);
      }
      
      toast({
        title: "Response submitted",
        description: "Your response has been added successfully!"
      });
      
      setIsSubmitting(false);
      setIsResponseVisible(false);
    }, 1000);
  };

  const handleEditResponse = () => {
    if (!currentUser) return;
    
    const userResponse = responses.find(r => r.authorId === currentUser.id);
    if (userResponse) {
      setEditingResponseId(userResponse.id);
      setEditContent(userResponse.content);
    }
  };

  const handleSaveEdit = () => {
    if (!editingResponseId || !currentUser) return;
    
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
  };

  const handleCancelEdit = () => {
    setEditingResponseId(null);
    setEditContent("");
  };

  const handleDeleteResponse = () => {
    if (!currentUser) return;
    
    const userResponseId = responses.find(r => r.authorId === currentUser.id)?.id;
    if (userResponseId) {
      setResponses(prev => prev.filter(response => response.id !== userResponseId));
      
      toast({
        title: "Response deleted",
        description: "Your response has been deleted successfully!"
      });
    }
  };
  
  const canRespond = (hasSubscription || isOneTimeUnlocked || hasReviewAccess) && canCustomerRespond() && !hasUserResponded();
  
  return (
    <div className="mt-4">
      {/* Display existing responses */}
      <CustomerResponseList 
        responses={responses} 
        editingResponseId={editingResponseId}
        editContent={editContent}
        setEditContent={setEditContent}
        onSaveEdit={handleSaveEdit}
        onCancelEdit={handleCancelEdit}
      />
      
      {/* Show response actions based on subscription status */}
      <CustomerResponseActions 
        canRespond={canRespond}
        isResponseVisible={isResponseVisible}
        setIsResponseVisible={setIsResponseVisible}
        hideReplyOption={hideReplyOption}
        hasUserResponded={hasUserResponded()}
        currentUserId={currentUser?.id}
        onEditResponse={handleEditResponse}
        onDeleteResponse={handleDeleteResponse}
        hasSubscription={hasSubscription}
      />
      
      {/* Response form - only shown when clicked respond */}
      {isResponseVisible && (
        <CustomerResponseForm
          onSubmit={handleSubmitResponse}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};

export default CustomerReviewResponse;
