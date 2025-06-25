
import { useAuth } from "@/contexts/auth";

interface UseResponsePermissionsProps {
  hasSubscription: boolean;
  isOneTimeUnlocked: boolean;
  reviewAuthorId?: string;
}

export const useResponsePermissions = ({
  hasSubscription,
  isOneTimeUnlocked,
  reviewAuthorId
}: UseResponsePermissionsProps) => {
  const { currentUser } = useAuth();

  const canUserRespond = (): boolean => {
    if (!currentUser) return false;
    
    const isCustomerUser = currentUser.type === "customer";
    const isBusinessUser = currentUser.type === "business";
    
    // For customer users: they need subscription or one-time access
    if (isCustomerUser) {
      return hasSubscription || isOneTimeUnlocked;
    }
    
    // For business users: they need subscription or one-time access, and cannot respond to their own reviews
    if (isBusinessUser) {
      const isReviewAuthor = currentUser.id === reviewAuthorId;
      if (isReviewAuthor) return false;
      return hasSubscription || isOneTimeUnlocked;
    }
    
    return false;
  };

  return { canUserRespond };
};
