
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth";
import CustomerResponseList from "./CustomerResponseList";
import ArchivedResponseDisplay from "./ArchivedResponseDisplay";
import CustomerResponseForm from "./CustomerResponseForm";
import { useCustomerResponseManagement } from "@/hooks/useCustomerResponseManagement";

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
  isOneTimeUnlocked?: boolean;
  hideReplyOption?: boolean;
  reviewAuthorId: string;
  onResponseSubmitted?: (response: Response) => void;
}

const CustomerReviewResponse: React.FC<CustomerReviewResponseProps> = ({
  reviewId,
  responses: initialResponses,
  hasSubscription,
  isOneTimeUnlocked = false,
  hideReplyOption = false,
  reviewAuthorId,
  onResponseSubmitted
}) => {
  const { currentUser } = useAuth();
  const [showResponseForm, setShowResponseForm] = useState(false);
  
  const {
    responses,
    archivedResponse,
    handleSubmitResponse,
    handleDeleteResponse,
    canCustomerRespond
  } = useCustomerResponseManagement(
    reviewId,
    initialResponses,
    reviewAuthorId,
    onResponseSubmitted
  );

  const hasAccess = hasSubscription || isOneTimeUnlocked;

  const handleFormSubmit = async (content: string) => {
    const success = await handleSubmitResponse(content);
    if (success) {
      setShowResponseForm(false);
    }
    return success;
  };

  const handleFormCancel = () => {
    setShowResponseForm(false);
  };

  console.log(`CustomerReviewResponse rendering review ${reviewId} with valid responses:`, responses);
  console.log(`Archived response available:`, !!archivedResponse);

  return (
    <div className="mt-4 border-t pt-4">
      <CustomerResponseList
        responses={responses}
        onDelete={handleDeleteResponse}
      />

      <ArchivedResponseDisplay
        archivedResponse={archivedResponse}
        showWhenNoResponses={responses.length === 0}
      />

      {!hideReplyOption && currentUser && hasAccess && canCustomerRespond() && (
        <div className="mt-4">
          {showResponseForm ? (
            <CustomerResponseForm
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
            />
          ) : (
            <Button onClick={() => setShowResponseForm(true)}>
              Respond
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerReviewResponse;
