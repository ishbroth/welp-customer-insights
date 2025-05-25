
import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { fetchUserProfile, loadOneTimeAccessResources, refreshUserProfile } from "./authUtils";

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

  // List of permanent accounts with subscription access
  const permanentAccountEmails = [
    'iw@thepaintedpainter.com',
    'isaac.wiley99@gmail.com'
  ];

  // Initialize user data - profile and one-time access resources
  const initUserData = async (userId: string, forceRefresh: boolean = false) => {
    try {
      console.log("Initializing user data for:", userId, "forceRefresh:", forceRefresh);
      
      // Always force refresh to get the latest data from database
      const [userProfile, accessResources] = await Promise.all([
        refreshUserProfile(userId), // Always use refreshUserProfile to ensure fresh data
        loadOneTimeAccessResources(userId)
      ]);
      
      console.log("Fetched user profile:", userProfile);
      
      if (userProfile) {
        setCurrentUser(userProfile);
        console.log("Set current user:", userProfile);
        
        // Check if this is one of the permanent accounts with subscription
        if (permanentAccountEmails.includes(userProfile.email)) {
          setIsSubscribed(true);
          console.log("Permanent account detected, setting subscription to true");
        }
      } else {
        console.error("No user profile found for userId:", userId);
        setCurrentUser(null);
      }
      
      setOneTimeAccessResources(accessResources);
    } catch (error) {
      console.error("Error initializing user data:", error);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced setCurrentUser function that also persists to database
  const enhancedSetCurrentUser = (user: User | null) => {
    console.log("Enhanced setCurrentUser called with:", user);
    setCurrentUser(user);
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
      
      // Check if this is a permanent account and set subscription accordingly
      if (permanentAccountEmails.includes(mockUser.email)) {
        setIsSubscribed(true);
        console.log("Mock permanent account detected, setting subscription to true");
      }
      
      setLoading(false);
      // Clean up mock user after setting it
      delete window.__CURRENT_USER__;
      return;
    }
    
    // First check for existing session immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", session?.user?.id);
      setSession(session);
      if (session?.user) {
        console.log("Initial session found, initializing user data");
        initUserData(session.user.id, true);
      } else {
        console.log("No initial session found");
        setLoading(false);
      }
    });
    
    // Then set up auth state listener for future changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state change event:", event, "session user id:", session?.user?.id);
        setSession(session);
        
        if (session?.user) {
          // Always force refresh on any auth state change to ensure we have latest data
          console.log("User authenticated via state change, refreshing profile data from database");
          await initUserData(session.user.id, true);
        } else {
          console.log("No session in state change, clearing user data");
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

  // Fetch subscription status from Stripe when user changes (skip for permanent accounts)
  useEffect(() => {
    const checkUserSubscription = async () => {
      if (!currentUser) {
        setIsSubscribed(false);
        return;
      }
      
      // Skip subscription check for permanent accounts
      if (permanentAccountEmails.includes(currentUser.email)) {
        setIsSubscribed(true);
        console.log("Permanent account detected, skipping Stripe subscription check");
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
    setCurrentUser: enhancedSetCurrentUser,
    session,
    loading,
    isSubscribed,
    setIsSubscribed,
    oneTimeAccessResources,
    setOneTimeAccessResources,
    initUserData
  };
};
