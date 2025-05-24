
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
        
        // Check if this is one of the admin accounts with permanent subscription
        const adminAccountIds = [
          "10000000-0000-0000-0000-000000000001", // Business Admin
          "10000000-0000-0000-0000-000000000002"  // Customer Admin
        ];
        
        if (adminAccountIds.includes(userId)) {
          setIsSubscribed(true);
          console.log("Admin account detected, setting subscription to true");
        }
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
      const mockUser = window.__CURRENT_USER__;
      
      // Update the business admin profile if it's the business admin account
      if (mockUser.id === "10000000-0000-0000-0000-000000000001") {
        mockUser.name = "The Painted Painter";
      }
      
      setCurrentUser(mockUser);
      
      // Check if this is an admin account and set subscription accordingly
      const adminAccountIds = [
        "10000000-0000-0000-0000-000000000001", // Business Admin
        "10000000-0000-0000-0000-000000000002"  // Customer Admin
      ];
      
      if (adminAccountIds.includes(mockUser.id)) {
        setIsSubscribed(true);
        console.log("Mock admin account detected, setting subscription to true");
      }
      
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
          setIsSubscribed(false);
          setLoading(false);
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch subscription status from Stripe when user changes (skip for admin accounts)
  useEffect(() => {
    const checkUserSubscription = async () => {
      if (!currentUser) {
        setIsSubscribed(false);
        return;
      }
      
      // Skip subscription check for admin accounts
      const adminAccountIds = [
        "10000000-0000-0000-0000-000000000001", // Business Admin
        "10000000-0000-0000-0000-000000000002"  // Customer Admin
      ];
      
      if (adminAccountIds.includes(currentUser.id)) {
        setIsSubscribed(true);
        console.log("Admin account detected, skipping Stripe subscription check");
        return;
      }
      
      try {
        // Call our edge function to check subscription status for regular users
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
