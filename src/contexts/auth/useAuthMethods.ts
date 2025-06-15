
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuthLogin } from "./hooks/useAuthLogin";
import { useAuthSignup } from "./hooks/useAuthSignup";
import { useLogout } from "./hooks/useLogout";
import { useProfileUpdate } from "./hooks/useProfileUpdate";
import { useAccessControl } from "./hooks/useAccessControl";

/**
 * Hook for managing authentication methods
 */
export const useAuthMethods = (
  setIsSubscribed: (value: boolean) => void,
  oneTimeAccessResources: string[],
  setOneTimeAccessResources: (value: string[]) => void,
  currentUser: User | null,
  setCurrentUser: (user: User | null) => void
) => {
  const { login } = useAuthLogin();
  const { signup } = useAuthSignup();
  const { logout: baseLogout } = useLogout(setIsSubscribed);
  const { updateProfile } = useProfileUpdate(currentUser, setCurrentUser);
  const { hasOneTimeAccess, markOneTimeAccess } = useAccessControl(
    currentUser,
    oneTimeAccessResources,
    setOneTimeAccessResources
  );

  // Enhanced logout that also clears current user
  const logout = async () => {
    await baseLogout();
    setCurrentUser(null);
  };

  return {
    login,
    signup,
    logout,
    updateProfile,
    hasOneTimeAccess,
    markOneTimeAccess
  };
};
