
import React, { useState } from "react";
import { Session } from "@supabase/supabase-js";
import { User } from "@/types";
import { logger } from '@/utils/logger';

const authLogger = logger.withContext('AuthStateManagement');

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
    authLogger.debug("Enhanced setCurrentUser called with:", user);
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
