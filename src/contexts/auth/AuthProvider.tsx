
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { AuthContextType, SignupData } from "./types";
import { fetchUserProfile, checkSubscriptionStatus, loadOneTimeAccessResources } from "./authUtils";

// Create the Auth Context
const AuthContext = createContext<AuthContextType | null>(null);

// Auth Provider Component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  // For tracking one-time access resources
  const [oneTimeAccessResources, setOneTimeAccessResources] = useState<string[]>([]);

  // Fetch subscription status when user changes
  useEffect(() => {
    const checkUserSubscription = async () => {
      if (!currentUser) {
        setIsSubscribed(false);
        return;
      }
      
      const hasSubscription = await checkSubscriptionStatus(currentUser.id);
      setIsSubscribed(hasSubscription);
    };

    checkUserSubscription();
  }, [currentUser]);

  // Set up auth state listener on mount
  useEffect(() => {
    setLoading(true);
    
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

  // Login function using Supabase
  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        console.error("Login error:", error);
        return { success: false, error: error.message };
      }

      // Session and user will be set by the auth state listener
      return { success: true };
    } catch (error: any) {
      console.error("Login error:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  };

  // Signup function using Supabase
  const signup = async ({
    email,
    password,
    name,
    phone,
    zipCode,
    address,
    city,
    state,
    type,
  }: SignupData) => {
    try {
      // Sign up the user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: { name, type }
        }
      });

      if (error) {
        console.error("Signup error:", error);
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Create a profile record in the profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            name: name,
            phone: phone,
            address: address,
            city: city,
            state: state,
            zipcode: zipCode, // Note: Updated to match DB field name
            type: type,
            created_at: new Date().toISOString(),
          });

        if (profileError) {
          console.error("Profile creation error:", profileError);
          return { success: false, error: profileError.message };
        }

        // User and session will be set by the auth state listener
        return { success: true };
      }

      return { success: false, error: "Failed to create user" };
    } catch (error: any) {
      console.error("Signup error:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  };

  // Logout function
  const logout = async () => {
    await supabase.auth.signOut();
    setIsSubscribed(false);
  };

  // Update profile - now updates both auth metadata and profiles table
  const updateProfile = async (updates: Partial<User>) => {
    if (!currentUser) return;

    try {
      // Update user metadata if needed
      if (updates.name || updates.email) {
        await supabase.auth.updateUser({
          email: updates.email,
          data: { name: updates.name }
        });
      }

      // Update the profiles table
      const { error } = await supabase
        .from('profiles')
        .update({
          name: updates.name,
          phone: updates.phone,
          address: updates.address,
          city: updates.city,
          state: updates.state,
          zipcode: updates.zipCode, // Note: Updated to match DB field name
          avatar: updates.avatar,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.id);

      if (error) {
        throw error;
      }

      // Update the currentUser state
      setCurrentUser({ ...currentUser, ...updates });
    } catch (error) {
      console.error("Error updating profile", error);
      throw error;
    }
  };
  
  // One-time access functions, using Supabase
  const hasOneTimeAccess = (resourceId: string): boolean => {
    // Check if the resourceId exists in the local state
    return oneTimeAccessResources.includes(resourceId);
  };
  
  const markOneTimeAccess = async (resourceId: string) => {
    if (!currentUser) return;
    
    try {
      // Store in Supabase - using customer_access table instead of one_time_access
      const { error } = await supabase
        .from('customer_access')
        .insert({
          business_id: currentUser.id,
          customer_id: resourceId,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days expiry
        });
        
      if (error) {
        console.error("Error marking one-time access:", error);
      } else {
        // Update local state
        setOneTimeAccessResources(prev => [...prev, resourceId]);
      }
    } catch (error) {
      console.error("Error in markOneTimeAccess:", error);
    }
  };

  const value = {
    currentUser,
    session,
    loading,
    login,
    signup,
    logout,
    updateProfile,
    isSubscribed,
    setIsSubscribed,
    hasOneTimeAccess,
    markOneTimeAccess
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Create and export the useAuth hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
