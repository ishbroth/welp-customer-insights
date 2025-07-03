
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";

interface UseReviewNavigationProps {
  reviewerId: string;
  isUnlocked: boolean;
}

export const useReviewNavigation = ({ reviewerId, isUnlocked }: UseReviewNavigationProps) => {
  const { isSubscribed } = useAuth();
  const navigate = useNavigate();

  const handleBusinessNameClick = () => {
    if (isSubscribed || isUnlocked) {
      navigate(`/business-profile/${reviewerId}`);
    }
  };

  return {
    handleBusinessNameClick,
  };
};
