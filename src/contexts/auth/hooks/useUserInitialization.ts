
import { supabase } from "@/integrations/supabase/client";
import { refreshUserProfile, loadOneTimeAccessResources } from "../authUtils";

/**
 * Hook for initializing user data
 */
export const useUserInitialization = () => {
  // Initialize user data - profile and one-time access resources
  const initUserData = async (userId: string, forceRefresh: boolean = false) => {
    try {
      console.log("🔄 Initializing user data for:", userId, "forceRefresh:", forceRefresh);
      
      // Use Promise.race with a timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 10000)
      );
      
      const dataPromise = Promise.all([
        refreshUserProfile(userId),
        loadOneTimeAccessResources(userId)
      ]);
      
      const [userProfile, accessResources] = await Promise.race([
        dataPromise,
        timeoutPromise
      ]) as [any, string[]];
      
      console.log("👤 Fetched user profile:", userProfile);
      
      if (userProfile) {
        console.log("✅ Set current user:", userProfile);
        return { userProfile, accessResources };
      } else {
        console.error("❌ No user profile found for userId:", userId);
        return { userProfile: null, accessResources };
      }
    } catch (error) {
      console.error("❌ Error initializing user data:", error);
      return { userProfile: null, accessResources: [] };
    }
  };

  return { initUserData };
};
