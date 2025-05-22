
import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { fetchUserProfile, loadOneTimeAccessResources } from "./authUtils";

// Define the global window object with our custom property
declare global {
  interface Window {
    __CURRENT_USER__?: User;
  }
}

/**
 * Hook for managing authentication state
 */
export const useAuthState = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [oneTimeAccessResources, setOneTimeAccessResources] = useState<string[]>([]);

  // Initialize user data - profile and one-time access resources
  const initUserData = async (userId: string) => {
    try {
      const [userProfile, accessResources] = await Promise.all([
        fetchUserProfile(userId),
        loadOneTimeAccessResources(userId)
      ]);
      
      if (userProfile) {
        setCurrentUser(userProfile);
      }
      
      setOneTimeAccessResources(accessResources);
    } catch (error) {
      console.error("Error initializing user data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Set up auth state listener on mount
  useEffect(() => {
    setLoading(true);
    
    // Check for mock user first (for admin testing)
    if (window.__CURRENT_USER__) {
      setCurrentUser(window.__CURRENT_USER__);
      setLoading(false);
      // Clean up mock user after setting it
      delete window.__CURRENT_USER__;
      return;
    }
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        initUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session) {
          await initUserData(session.user.id);
        } else {
          setCurrentUser(null);
          setLoading(false);
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch subscription status from Stripe when user changes
  useEffect(() => {
    const checkUserSubscription = async () => {
      if (!currentUser) {
        setIsSubscribed(false);
        return;
      }
      
      try {
        // Call our new edge function to check subscription status
        const { data, error } = await supabase.functions.invoke("check-subscription");
        
        if (error) {
          console.error("Error checking subscription with Stripe:", error);
          return;
        }
        
        setIsSubscribed(data?.subscribed || false);
        console.log("Subscription status updated from Stripe:", data?.subscribed);
      } catch (error) {
        console.error("Error in checkUserSubscription:", error);
      }
    };

    checkUserSubscription();
  }, [currentUser]);

  return {
    currentUser,
    setCurrentUser,
    session,
    loading,
    isSubscribed,
    setIsSubscribed,
    oneTimeAccessResources,
    setOneTimeAccessResources,
    initUserData
  };
};
