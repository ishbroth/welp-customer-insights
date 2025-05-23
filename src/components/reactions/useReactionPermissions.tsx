
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";

interface UseReactionPermissionsProps {
  customerId: string;
}

export const useReactionPermissions = ({ customerId }: UseReactionPermissionsProps) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const checkPermissions = () => {
    // Don't allow reactions if not logged in
    if (!currentUser) {
      toast({
        title: "Login required",
        description: "Please login to react to reviews",
        variant: "destructive"
      });
      return false;
    }

    // Check if user is allowed to react to this review
    const isCustomerBeingReviewed = currentUser.id === customerId;
    const isBusinessUser = currentUser.type === "business";
    
    if (!isCustomerBeingReviewed && !isBusinessUser) {
      toast({
        title: "Not allowed",
        description: "Only the reviewed customer or other businesses can react to reviews",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };
  
  return { checkPermissions };
};
