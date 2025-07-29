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
    console.log('useConversationFlow: Analyzing conversation flow:', {
      responsesCount: responses?.length || 0,
      currentUserId: currentUser?.id,
      customerId,
      reviewerId,
      hasValidIds: !!(customerId && reviewerId)
    });

    // If there's no current user, they can't respond
    if (!currentUser) {
      return {
        canRespond: false,
        isMyTurn: false
      };
    }

    // If we don't have valid customer and reviewer IDs, prevent responses
    if (!customerId || !reviewerId) {
      console.log('❌ Missing customer or reviewer ID, preventing responses');
      return {
        canRespond: false,
        isMyTurn: false
      };
    }

    // Determine participation
    const isCustomerInConversation = currentUser.id === customerId;
    const isBusinessInConversation = currentUser.id === reviewerId;
    const canParticipate = isCustomerInConversation || isBusinessInConversation;

    // If user can't participate, they can't respond
    if (!canParticipate) {
      return {
        canRespond: false,
        isMyTurn: false
      };
    }

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

    if (!lastResponseAuthorId) {
      console.log('⚠️ Last response has no author ID');
      return {
        canRespond: true,
        isMyTurn: true
      };
    }

    // Determine if it's the current user's turn based on who sent the last response
    // If the last response was NOT from the current user, then it's their turn
    const isMyTurn = lastResponseAuthorId !== currentUser.id;
    
    // Additional check: prevent multiple consecutive responses from the same user
    // Count recent responses from the current user
    const recentUserResponses = responses.filter(r => r.authorId === currentUser.id);
    const lastTwoResponses = responses.slice(-2);
    const hasConsecutiveResponses = lastTwoResponses.length >= 2 && 
      lastTwoResponses.every(r => r.authorId === currentUser.id);
    
    // Don't allow response if user just sent consecutive responses
    const canRespond = isMyTurn && !hasConsecutiveResponses;

    console.log('useConversationFlow: Conversation status:', {
      isMyTurn,
      canParticipate,
      canRespond,
      isCustomerInConversation,
      isBusinessInConversation,
      lastResponseWasFromMe: lastResponseAuthorId === currentUser.id,
      hasConsecutiveResponses: hasConsecutiveResponses || false,
      recentUserResponsesCount: recentUserResponses?.length || 0,
      lastResponseAuthorId
    });

    return {
      canRespond,
      isMyTurn
    };
  }, [responses, customerId, reviewerId, currentUser]);

  return conversationStatus;
};