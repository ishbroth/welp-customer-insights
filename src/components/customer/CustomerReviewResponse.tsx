
import { useState } from "react";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import CustomerResponseList from "./CustomerResponseList";
import CustomerResponseForm from "./CustomerResponseForm";
import CustomerResponseActions from "./CustomerResponseActions";
import { useCustomerReviewResponses } from "@/hooks/useCustomerReviewResponses";
import { useCustomerResponseActions } from "@/hooks/useCustomerResponseActions";

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
  reviewAuthorId?: string;
}

const CustomerReviewResponse = ({ 
  reviewId, 
  responses: initialResponses, 
  hasSubscription, 
  isOneTimeUnlocked,
  hideReplyOption = false,
  onResponseSubmitted,
  reviewAuthorId
}: CustomerReviewResponseProps) => {
  const [isResponseVisible, setIsResponseVisible] = useState(false);
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const { responses, setResponses } = useCustomerReviewResponses(reviewId);
  
  const {
    isSubmitting,
    editingResponseId,
    editContent,
    setEditContent,
    handleSubmitResponse: originalHandleSubmitResponse,
    handleEditResponse,
    handleSaveEdit,
    handleCancelEdit,
    handleDeleteResponse: originalHandleDeleteResponse
  } = useCustomerResponseActions(reviewId, responses, setResponses);

  // Filter responses to only show active conversation
  // Hide business responses that are orphaned (customer deleted their response)
  const getActiveResponses = (): Response[] => {
    if (!currentUser) return responses;
    
    const sortedResponses = [...responses].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    const activeResponses: Response[] = [];
    let customerHasActiveResponse = false;
    
    for (const response of sortedResponses) {
      if (response.authorId === currentUser.id) {
        // Customer response - always include
        activeResponses.push(response);
        customerHasActiveResponse = true;
      } else if (response.authorId === reviewAuthorId && customerHasActiveResponse) {
        // Business response - only include if customer has an active response
        activeResponses.push(response);
      }
    }
    
    return activeResponses;
  };

  const activeResponses = getActiveResponses();

  // Enhanced delete handler that archives business responses
  const handleDeleteResponse = async () => {
    if (!currentUser) return;

    // Archive any business responses before deleting customer response
    const businessResponses = responses.filter(r => r.authorId === reviewAuthorId);
    
    // Store archived responses in localStorage for the business owner to retrieve
    if (businessResponses.length > 0) {
      const archivedKey = `archived_response_${reviewId}_${reviewAuthorId}`;
      localStorage.setItem(archivedKey, JSON.stringify({
        responses: businessResponses,
        archivedAt: new Date().toISOString(),
        originalCustomerResponseId: responses.find(r => r.authorId === currentUser.id)?.id
      }));
    }

    await originalHandleDeleteResponse();
  };

  // Determine if current user can respond based on conversation flow
  const canUserRespond = (): boolean => {
    if (!currentUser) return false;
    if (!hasSubscription && !isOneTimeUnlocked) return false;
    
    // If user wrote the review, they can't respond to their own review initially
    if (reviewAuthorId === currentUser.id && activeResponses.length === 0) {
      return false;
    }
    
    // If there are no responses yet, the person who DIDN'T write the review can respond
    if (activeResponses.length === 0) {
      return reviewAuthorId !== currentUser.id;
    }
    
    // If there are responses, check who wrote the last one
    const sortedResponses = [...activeResponses].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const lastResponse = sortedResponses[0];
    
    // User can respond if they didn't write the last response
    return lastResponse.authorId !== currentUser.id;
  };

  const hasUserResponded = (): boolean => {
    if (!currentUser) return false;
    return activeResponses.some(response => response.authorId === currentUser.id);
  };

  const handleSubmitResponse = async (responseText: string) => {
    if (responseText === "") {
      setIsResponseVisible(false);
      return;
    }

    if (!hasSubscription && !isOneTimeUnlocked) {
      toast({
        title: "Access required",
        description: "You need a subscription or one-time access to respond to reviews.",
        variant: "destructive"
      });
      return;
    }

    await originalHandleSubmitResponse(responseText);
    
    if (onResponseSubmitted) {
      const newResponse: Response = {
        id: `temp-${Date.now()}`,
        authorId: currentUser?.id || "",
        authorName: currentUser?.name || 'Customer',
        content: responseText,
        createdAt: new Date().toISOString()
      };
      onResponseSubmitted(newResponse);
    }
    
    setIsResponseVisible(false);
  };
  
  return (
    <div className="mt-4">
      <CustomerResponseList 
        responses={activeResponses} 
        editingResponseId={editingResponseId}
        editContent={editContent}
        setEditContent={setEditContent}
        onSaveEdit={handleSaveEdit}
        onCancelEdit={handleCancelEdit}
      />
      
      <CustomerResponseActions 
        canRespond={canUserRespond()}
        isResponseVisible={isResponseVisible}
        setIsResponseVisible={setIsResponseVisible}
        hideReplyOption={hideReplyOption}
        hasUserResponded={hasUserResponded()}
        currentUserId={currentUser?.id}
        responses={activeResponses}
        onEditResponse={handleEditResponse}
        onDeleteResponse={handleDeleteResponse}
        hasSubscription={hasSubscription}
      />
      
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
