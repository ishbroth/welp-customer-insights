
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Review } from "@/types";
import { useBusinessResponseConversation } from "@/hooks/useBusinessResponseConversation";
import { useArchivedResponses } from "@/hooks/useArchivedResponses";
import { useCleanupDuplicates } from "@/hooks/responses/useCleanupDuplicates";
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
  const { removeDuplicateResponses } = useCleanupDuplicates();

  const {
    responses,
    canRespond,
    isMyTurn,
    handleSubmitResponse,
    handleUpdateResponse,
    handleDeleteResponse,
    refetchResponses
  } = useBusinessResponseConversation(review, hasSubscription);

  // Force refresh responses when component mounts or review changes
  useEffect(() => {
    console.log(`🔄 BusinessReviewCardResponses mounted for review ${review.id}`);
    
    const loadAndCleanup = async () => {
      if (refetchResponses) {
        await refetchResponses();
        // Check for and clean up any duplicate responses
        await removeDuplicateResponses(review.id);
      }
    };
    
    loadAndCleanup();
  }, [review.id, refetchResponses, removeDuplicateResponses]);

  const onSubmitResponse = async (content: string) => {
    setIsSubmitting(true);
    const success = await handleSubmitResponse(content);
    setIsSubmitting(false);
    
    if (success) {
      setShowResponseForm(false);
      // Force refresh after successful submission
      if (refetchResponses) {
        setTimeout(() => refetchResponses(), 500);
      }
    }
    
    return success;
  };

  const onCancelResponse = () => {
    setShowResponseForm(false);
  };

  const onUpdateResponse = async (responseId: string, content: string) => {
    const success = await handleUpdateResponse(responseId, content);
    if (success && refetchResponses) {
      setTimeout(() => refetchResponses(), 500);
    }
    return success;
  };

  const onDeleteResponse = async (responseId: string) => {
    const success = await handleDeleteResponse(responseId);
    if (success && refetchResponses) {
      setTimeout(() => refetchResponses(), 500);
    }
    return success;
  };

  console.log(`📊 BusinessReviewCardResponses rendering review ${review.id}:`);
  console.log(`📝 Responses count: ${responses.length}`);
  console.log(`🔒 Can respond: ${canRespond}`);
  console.log(`⏰ Is my turn: ${isMyTurn}`);
  console.log(`💳 Has subscription: ${hasSubscription}`);
  console.log(`🎫 Review has customer ID: ${!!review.customerId}`);

  // Only show the response section if there are responses or if we can respond
  const shouldShowResponseSection = responses.length > 0 || (hasSubscription && review.customerId);

  if (!shouldShowResponseSection) {
    console.log('❌ Not showing response section - no responses and no subscription access');
    return null;
  }

  return (
    <div className="border-t pt-4 mb-4">
      <h4 className="text-md font-semibold mb-3">Customer Responses</h4>
      
      {/* Display existing responses */}
      {responses.length > 0 ? (
        responses.map((resp) => (
          <ResponseItem
            key={resp.id}
            response={resp}
            onUpdate={onUpdateResponse}
            onDelete={onDeleteResponse}
          />
        ))
      ) : (
        <div className="text-gray-500 text-sm mb-3">
          No responses yet. 
          {hasSubscription && review.customerId ? ' Start the conversation!' : ''}
        </div>
      )}
      
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
