
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser, Session } from "@supabase/supabase-js";
import { User } from "@/types";
import { useUserInitialization } from "./hooks/useUserInitialization";
import { useSecureAuth } from "./hooks/useSecureAuth";
import { logSecurityEvent } from "@/utils/rateLimiting";
import { AuthContextType, LoginResult, SignupData } from "./types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [oneTimeAccessResources, setOneTimeAccessResources] = useState<string[]>([]);

  const { initUserData } = useUserInitialization();
  const { secureLogin, secureSignup, securePasswordReset } = useSecureAuth();

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (mounted) {
          setSession(initialSession);
          
          if (initialSession?.user) {
            const { userProfile, accessResources } = await initUserData(initialSession.user.id);
            if (mounted) {
              setCurrentUser(userProfile);
              setOneTimeAccessResources(accessResources);
            }
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        await logSecurityEvent('auth_initialization_error', 'Error initializing authentication', undefined, { error: error.message });
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;

      console.log("Auth state changed:", event, newSession?.user?.id);
      
      try {
        setSession(newSession);
        
        if (newSession?.user && event === 'SIGNED_IN') {
          const { userProfile, accessResources } = await initUserData(newSession.user.id);
          setCurrentUser(userProfile);
          setOneTimeAccessResources(accessResources);
          await logSecurityEvent('session_established', 'User session established', newSession.user.id);
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
          setOneTimeAccessResources([]);
          await logSecurityEvent('session_ended', 'User session ended');
        }
      } catch (error) {
        console.error("Error handling auth state change:", error);
        await logSecurityEvent('auth_state_change_error', 'Error handling auth state change', newSession?.user?.id, { error: error.message });
      } finally {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<LoginResult> => {
    try {
      const result = await secureLogin(email, password);
      
      if (result.success) {
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "An unexpected error occurred during login" };
    }
  };

  const signup = async (data: SignupData) => {
    try {
      const result = await secureSignup(data.email, data.password, data);
      
      if (result.success) {
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("Signup error:", error);
      return { success: false, error: "An unexpected error occurred during signup" };
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        await logSecurityEvent('logout_error', 'Error during logout', currentUser?.id, { error: error.message });
        throw error;
      }
      
      setCurrentUser(null);
      setSession(null);
      setOneTimeAccessResources([]);
      await logSecurityEvent('logout_success', 'User logged out successfully', currentUser?.id);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!currentUser) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', currentUser.id);

      if (error) {
        await logSecurityEvent('profile_update_error', 'Error updating profile', currentUser.id, { error: error.message });
        throw error;
      }

      setCurrentUser({ ...currentUser, ...updates });
      await logSecurityEvent('profile_updated', 'Profile updated successfully', currentUser.id);
    } catch (error) {
      console.error("Profile update error:", error);
      throw error;
    }
  };

  const hasOneTimeAccess = (resourceId: string): boolean => {
    return oneTimeAccessResources.includes(resourceId);
  };

  const markOneTimeAccess = async (resourceId: string) => {
    if (!currentUser) return;
    
    try {
      await supabase
        .from('guest_access')
        .insert({
          access_token: currentUser.id,
          review_id: resourceId,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        });
      
      setOneTimeAccessResources(prev => [...prev, resourceId]);
      await logSecurityEvent('one_time_access_granted', 'One-time access granted', currentUser.id, { resourceId });
    } catch (error) {
      console.error("Error marking one-time access:", error);
      await logSecurityEvent('one_time_access_error', 'Error granting one-time access', currentUser.id, { error: error.message });
    }
  };

  const value: AuthContextType = {
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
    markOneTimeAccess,
    setCurrentUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
