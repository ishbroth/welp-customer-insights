
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Review } from "@/types";
import { useBusinessResponseConversation } from "@/hooks/useBusinessResponseConversation";
import { useArchivedResponses } from "@/hooks/useArchivedResponses";
import ResponseItem from "./responses/ResponseItem";
import ResponseForm from "./responses/ResponseForm";

interface BusinessReviewCardResponsesProps {
  review: Review;
  hasSubscription: boolean;
}

const BusinessReviewCardResponses: React.FC<BusinessReviewCardResponsesProps> = ({
  review,
  hasSubscription,
}) => {
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { archivedResponse } = useArchivedResponses(review.id);

  const {
    responses,
    canRespond,
    isMyTurn,
    handleSubmitResponse,
    handleUpdateResponse,
    handleDeleteResponse
  } = useBusinessResponseConversation(review, hasSubscription);

  const onSubmitResponse = async (content: string) => {
    setIsSubmitting(true);
    const success = await handleSubmitResponse(content);
    setIsSubmitting(false);
    
    if (success) {
      setShowResponseForm(false);
    }
    
    return success;
  };

  const onCancelResponse = () => {
    setShowResponseForm(false);
  };

  console.log(`BusinessReviewCardResponses rendering review ${review.id} with ${responses.length} responses:`, responses);
  console.log(`Conversation status: canRespond=${canRespond}, isMyTurn=${isMyTurn}`);

  // Only show the response section if there are responses or if we can respond
  const shouldShowResponseSection = responses.length > 0 || (hasSubscription && review.customerId);

  if (!shouldShowResponseSection) {
    console.log('Not showing response section - no responses and no subscription access');
    return null;
  }

  return (
    <div className="border-t pt-4 mb-4">
      <h4 className="text-md font-semibold mb-3">Customer Responses</h4>
      
      {/* Display existing responses */}
      {responses.map((resp) => (
        <ResponseItem
          key={resp.id}
          response={resp}
          onUpdate={handleUpdateResponse}
          onDelete={handleDeleteResponse}
        />
      ))}
      
      {/* Response form - only show if it's business's turn to respond */}
      {canRespond && isMyTurn && (
        <>
          {showResponseForm ? (
            <ResponseForm
              onSubmit={onSubmitResponse}
              onCancel={onCancelResponse}
              isSubmitting={isSubmitting}
            />
          ) : (
            <div className="mt-4 flex justify-end">
              <Button 
                onClick={() => setShowResponseForm(true)}
                size="sm"
              >
                Respond to Customer
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BusinessReviewCardResponses;
