
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";

interface UseReviewNavigationProps {
  reviewerId: string;
  isUnlocked: boolean;
}

export const useReviewNavigation = ({ reviewerId, isUnlocked }: UseReviewNavigationProps) => {
  const { isSubscribed, currentUser } = useAuth();
  const navigate = useNavigate();

  const handleBusinessNameClick = () => {
    if (isSubscribed || isUnlocked) {
      // If the reviewerId matches current user's ID, go to their own profile
      if (currentUser?.id === reviewerId) {
        navigate('/profile');
      } else {
        navigate(`/business-profile/${reviewerId}`, { state: { readOnly: true } });
      }
    }
  };

  return {
    handleBusinessNameClick,
  };
};
