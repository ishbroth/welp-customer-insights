
import { useAuth } from "@/contexts/auth";
import { Response } from "./types";

interface ConversationFlowProps {
  responses: Response[];
  customerId?: string;
  reviewerId?: string;
}

export const useConversationFlow = ({ responses, customerId, reviewerId }: ConversationFlowProps) => {
  const { currentUser } = useAuth();

  if (!currentUser || !customerId || !reviewerId) {
    return { canRespond: false, isMyTurn: false, nextResponderId: null };
  }

  // Sort responses by creation time
  const sortedResponses = [...responses].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  // If no responses yet, customer should respond first
  if (sortedResponses.length === 0) {
    const isCustomerTurn = currentUser.id === customerId;
    return { 
      canRespond: isCustomerTurn, 
      isMyTurn: isCustomerTurn,
      nextResponderId: customerId
    };
  }

  // Get the last response to determine whose turn it is
  const lastResponse = sortedResponses[sortedResponses.length - 1];
  
  // Determine who should respond next
  const nextResponderId = lastResponse.authorId === customerId ? reviewerId : customerId;
  const isMyTurn = currentUser.id === nextResponderId;
  
  return { 
    canRespond: isMyTurn, 
    isMyTurn,
    nextResponderId
  };
};
