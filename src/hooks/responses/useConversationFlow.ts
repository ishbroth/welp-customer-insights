
import { useMemo } from "react";

interface UseConversationFlowProps {
  responses: any[];
  customerId?: string;
  reviewerId?: string;
}

export const useConversationFlow = ({
  responses,
  customerId,
  reviewerId
}: UseConversationFlowProps) => {
  const conversationStatus = useMemo(() => {
    // If no responses exist, anyone can start the conversation
    if (!responses || responses.length === 0) {
      return {
        canRespond: true,
        isMyTurn: true
      };
    }

    // Get the last response to determine whose turn it is
    const lastResponse = responses[responses.length - 1];
    const lastResponseAuthorId = lastResponse?.authorId;

    console.log('useConversationFlow: Analyzing conversation flow:', {
      responsesCount: responses.length,
      lastResponseAuthorId,
      customerId,
      reviewerId,
      lastResponse
    });

    // Determine if current user can respond based on conversation flow
    // The person who didn't send the last message can respond next
    const canRespond = true; // Allow responses for now, let permissions handle restrictions
    const isMyTurn = true; // Simplified for now

    return {
      canRespond,
      isMyTurn
    };
  }, [responses, customerId, reviewerId]);

  return conversationStatus;
};
