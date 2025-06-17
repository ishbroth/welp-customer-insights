
import { useState, useEffect } from "react";
import { Review } from "@/types";
import { Response } from "./responses/types";
import { useResponseActions } from "./responses/useResponseActions";
import { useConversationStatus } from "./responses/useConversationStatus";
import { useResponseDataService } from "./responses/responseDataService";

export const useBusinessResponseConversation = (review: Review, hasSubscription: boolean) => {
  const [responses, setResponses] = useState<Response[]>([]);
  const { fetchAndFormatResponses } = useResponseDataService();
  const conversationStatus = useConversationStatus(responses, review);
  const responseActions = useResponseActions(review.id, hasSubscription);

  useEffect(() => {
    const loadResponses = async () => {
      const formattedResponses = await fetchAndFormatResponses(review);
      setResponses(formattedResponses);
    };

    loadResponses();
  }, [review.id, review.customerId, review.customerName]);

  const handleSubmitResponse = async (responseContent: string): Promise<boolean> => {
    const success = await responseActions.handleSubmitResponse(responseContent);
    
    if (success) {
      // Refresh responses after successful submission
      const formattedResponses = await fetchAndFormatResponses(review);
      setResponses(formattedResponses);
    }
    
    return success;
  };

  const handleUpdateResponse = async (responseId: string, content: string): Promise<boolean> => {
    const success = await responseActions.handleUpdateResponse(responseId, content);
    
    if (success) {
      setResponses(prev => prev.map(response =>
        response.id === responseId
          ? { ...response, content }
          : response
      ));
    }
    
    return success;
  };

  const handleDeleteResponse = async (responseId: string): Promise<boolean> => {
    const success = await responseActions.handleDeleteResponse(responseId);
    
    if (success) {
      setResponses(prev => prev.filter(response => response.id !== responseId));
    }
    
    return success;
  };

  return {
    responses,
    canRespond: conversationStatus.canRespond,
    isMyTurn: conversationStatus.isMyTurn,
    handleSubmitResponse,
    handleUpdateResponse,
    handleDeleteResponse
  };
};
