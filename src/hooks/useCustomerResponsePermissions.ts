
import { useAuth } from "@/contexts/auth";

interface Response {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export const useCustomerResponsePermissions = (
  reviewId: string,
  responses: Response[],
  hasSubscription: boolean,
  isOneTimeUnlocked: boolean
) => {
  const { currentUser, hasOneTimeAccess } = useAuth();

  const hasReviewAccess = hasOneTimeAccess(reviewId);

  const hasUserResponded = () => {
    if (!currentUser) return false;
    return responses.some(response => response.authorId === currentUser.id);
  };

  const canCustomerRespond = () => {
    if (!currentUser || !responses.length) return true;

    const sortedResponses = [...responses].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const lastResponse = sortedResponses[0];
    return lastResponse.authorId !== currentUser.id;
  };

  const canRespond = (hasSubscription || isOneTimeUnlocked || hasReviewAccess) && 
                    canCustomerRespond() && 
                    !hasUserResponded();

  return {
    hasReviewAccess,
    hasUserResponded,
    canCustomerRespond,
    canRespond
  };
};
