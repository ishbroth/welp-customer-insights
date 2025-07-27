
import React, { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStateManagement } from "./hooks/useAuthStateManagement";
import { useUserInitialization } from "./hooks/useUserInitialization";
import { useSubscriptionStatus } from "./hooks/useSubscriptionStatus";
import { useGuestAccessUtils } from "./hooks/useGuestAccessUtils";

// Define the global window object with our custom property
declare global {
  interface Window {
    __CURRENT_USER__?: any;
  }
}

/**
 * Hook for managing authentication state
 */
export const useAuthState = () => {
  const {
    currentUser,
    setCurrentUser,
    session,
    setSession,
    loading,
    setLoading,
    isSubscribed,
    setIsSubscribed,
    oneTimeAccessResources,
    setOneTimeAccessResources
  } = useAuthStateManagement();

  const { initUserData } = useUserInitialization();
  const guestAccessUtils = useGuestAccessUtils();

  // Use subscription status hook
  useSubscriptionStatus(currentUser, setIsSubscribed);

  // Enhanced initialization function
  const enhancedInitUserData = async (userId: string, forceRefresh: boolean = false) => {
    try {
      const { userProfile, accessResources } = await initUserData(userId, forceRefresh);
      
      if (userProfile) {
        setCurrentUser(userProfile);
      } else {
        setCurrentUser(null);
      }
      
      setOneTimeAccessResources(accessResources);
    } catch (error) {
      console.error("❌ Error in enhanced init user data:", error);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Set up auth state listener on mount
  useEffect(() => {
    setLoading(true);
    
    // Check for mock user first (for admin testing)
    if (window.__CURRENT_USER__) {
      const mockUser = window.__CURRENT_USER__;
      
      // Update the business admin profile if it's the business admin account
      if (mockUser.id === "10000000-0000-0000-0000-000000000001") {
        mockUser.name = "The Painted Painter";
      }
      
      setCurrentUser(mockUser);
      setLoading(false);
      // Clean up mock user after setting it
      delete window.__CURRENT_USER__;
      return;
    }
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("🔐 Auth state change event:", event, "session user id:", session?.user?.id);
        setSession(session);
        
        if (session?.user) {
          // Initialize user data immediately without setTimeout
          await enhancedInitUserData(session.user.id, true);
        } else {
          console.log("❌ No session, clearing user data");
          setCurrentUser(null);
          setIsSubscribed(false);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log("🔍 Initial session check:", session?.user?.id);
      setSession(session);
      if (session?.user) {
        // Initialize user data immediately without setTimeout
        await enhancedInitUserData(session.user.id, true);
      } else {
        setLoading(false);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    currentUser,
    setCurrentUser,
    session,
    loading,
    isSubscribed,
    setIsSubscribed,
    oneTimeAccessResources,
    setOneTimeAccessResources,
    initUserData: enhancedInitUserData,
    ...guestAccessUtils
  };
};
