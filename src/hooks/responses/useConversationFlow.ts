
import { useMemo } from "react";
import { useAuth } from "@/contexts/auth";

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
  const { currentUser } = useAuth();

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
      currentUserId: currentUser?.id,
      customerId,
      reviewerId,
      lastResponse
    });

    // If there's no current user, they can't respond
    if (!currentUser) {
      return {
        canRespond: false,
        isMyTurn: false
      };
    }

    // Determine if it's the current user's turn based on who sent the last response
    // If the last response was NOT from the current user, then it's their turn
    const isMyTurn = lastResponseAuthorId !== currentUser.id;
    
    // They can respond if it's their turn AND they are either the customer or the business owner
    const isCustomerInConversation = currentUser.id === customerId;
    const isBusinessInConversation = currentUser.id === reviewerId;
    const canParticipate = isCustomerInConversation || isBusinessInConversation;
    
    const canRespond = isMyTurn && canParticipate;

    console.log('useConversationFlow: Conversation status:', {
      isMyTurn,
      canParticipate,
      canRespond,
      isCustomerInConversation,
      isBusinessInConversation,
      lastResponseWasFromMe: lastResponseAuthorId === currentUser.id
    });

    return {
      canRespond,
      isMyTurn
    };
  }, [responses, customerId, reviewerId, currentUser]);

  return conversationStatus;
};
