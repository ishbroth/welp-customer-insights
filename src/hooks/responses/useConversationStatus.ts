
import { useConversationFlow } from "./useConversationFlow";
import { Response, ConversationStatus } from "./types";
import { Review } from "@/types";

export const useConversationStatus = (
  responses: Response[], 
  review: Review
): ConversationStatus => {
  const { canRespond, isMyTurn } = useConversationFlow({
    responses,
    customerId: review.customerId,
    reviewerId: review.reviewerId
  });

  return { canRespond, isMyTurn };
};
