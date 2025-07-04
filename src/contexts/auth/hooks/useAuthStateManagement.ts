
import { useState } from "react";
import { Session } from "@supabase/supabase-js";
import { User } from "@/types";

/**
 * Hook for managing core authentication state
 */
export const useAuthStateManagement = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [oneTimeAccessResources, setOneTimeAccessResources] = useState<string[]>([]);

  // Enhanced setCurrentUser function that also persists to database
  const enhancedSetCurrentUser = (user: User | null) => {
    console.log("Enhanced setCurrentUser called with:", user);
    setCurrentUser(user);
  };

  return {
    currentUser,
    setCurrentUser: enhancedSetCurrentUser,
    session,
    setSession,
    loading,
    setLoading,
    isSubscribed,
    setIsSubscribed,
    oneTimeAccessResources,
    setOneTimeAccessResources
  };
};
