
import { useState } from "react";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import CustomerResponseList from "./CustomerResponseList";
import CustomerResponseForm from "./CustomerResponseForm";
import CustomerResponseActions from "./CustomerResponseActions";
import { useCustomerReviewResponses } from "@/hooks/useCustomerReviewResponses";
import { useCustomerResponseActions } from "@/hooks/useCustomerResponseActions";
import { useCustomerResponsePermissions } from "@/hooks/useCustomerResponsePermissions";

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
    handleDeleteResponse
  } = useCustomerResponseActions(reviewId, responses, setResponses);

  const { canRespond, hasUserResponded } = useCustomerResponsePermissions(
    reviewId,
    responses,
    hasSubscription,
    isOneTimeUnlocked
  );

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
        responses={responses} 
        editingResponseId={editingResponseId}
        editContent={editContent}
        setEditContent={setEditContent}
        onSaveEdit={handleSaveEdit}
        onCancelEdit={handleCancelEdit}
      />
      
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
