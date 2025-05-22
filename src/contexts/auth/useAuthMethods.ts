
import { User } from "@/types";
import { SignupData } from "./types";
import { useAuthLogin } from "./hooks/useAuthLogin";
import { useAuthSignup } from "./hooks/useAuthSignup";
import { useProfileUpdate } from "./hooks/useProfileUpdate";
import { useAccessControl } from "./hooks/useAccessControl";
import { useLogout } from "./hooks/useLogout";

/**
 * Hook for authentication methods
 */
export const useAuthMethods = (
  setIsSubscribed: (value: boolean) => void,
  oneTimeAccessResources: string[],
  setOneTimeAccessResources: React.Dispatch<React.SetStateAction<string[]>>,
  currentUser: User | null
) => {
  const { login } = useAuthLogin();
  const { signup } = useAuthSignup();
  const { logout } = useLogout(setIsSubscribed);
  const { updateProfile } = useProfileUpdate(currentUser);
  const { hasOneTimeAccess, markOneTimeAccess } = useAccessControl(
    currentUser,
    oneTimeAccessResources,
    setOneTimeAccessResources
  );

  return {
    login,
    signup,
    logout,
    updateProfile,
    hasOneTimeAccess,
    markOneTimeAccess
  };
};
