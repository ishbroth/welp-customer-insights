
import { useAuth } from "@/contexts/auth";
import { Response, ConversationStatus } from "./types";
import { Review } from "@/types";

export const useConversationStatus = (
  responses: Response[], 
  review: Review
): ConversationStatus => {
  const { currentUser } = useAuth();

  if (!currentUser || !review.customerId) {
    return { canRespond: false, isMyTurn: false };
  }

  // Sort responses by creation time
  const sortedResponses = [...responses].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  // If no responses yet, customer should respond first
  if (sortedResponses.length === 0) {
    return { 
      canRespond: currentUser.id === review.customerId, 
      isMyTurn: currentUser.id === review.customerId 
    };
  }

  // Get the last response
  const lastResponse = sortedResponses[sortedResponses.length - 1];
  
  // If the last response was from the customer, it's business's turn
  if (lastResponse.authorId === review.customerId) {
    const isBusinessTurn = currentUser.id === review.reviewerId;
    return { 
      canRespond: isBusinessTurn, 
      isMyTurn: isBusinessTurn 
    };
  }
  
  // If the last response was from the business, it's customer's turn
  if (lastResponse.authorId === review.reviewerId) {
    const isCustomerTurn = currentUser.id === review.customerId;
    return { 
      canRespond: isCustomerTurn, 
      isMyTurn: isCustomerTurn 
    };
  }

  return { canRespond: false, isMyTurn: false };
};
