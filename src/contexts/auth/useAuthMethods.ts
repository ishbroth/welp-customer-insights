import React from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { SignupData, LoginResult } from "./types";
import { logger } from '@/utils/logger';

const authLogger = logger.withContext('AuthMethods');

/**
 * Hook for authentication methods (login, signup, logout, etc.)
 */
export const useAuthMethods = (
  setIsSubscribed: (value: boolean) => void,
  oneTimeAccessResources: string[],
  setOneTimeAccessResources: (resources: string[]) => void,
  currentUser: User | null,
  setCurrentUser: (user: User | null) => void
) => {
  const login = async (email: string, password: string): Promise<LoginResult> => {
    authLogger.debug("Attempting login for:", email);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        authLogger.error("Login error:", error);

        // Check if this is a "user not found" error, which might indicate incomplete registration
        if (error.message === "Invalid login credentials") {
          authLogger.debug("Invalid login credentials - checking if user exists but needs phone verification");
          
          // Check if a user exists with this email but might need phone verification
          try {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('id, type, phone, verified, name, address, city, state, zipcode')
              .eq('email', email)
              .maybeSingle();
            
            if (profile && !profileError) {
              authLogger.debug("User profile found but login failed");
              authLogger.debug("Profile details:", {
                id: profile.id,
                type: profile.type,
                phone: profile.phone,
                verified: profile.verified
              });

              // If user has a phone and is not verified, they need phone verification
              if (profile.phone && !profile.verified) {
                authLogger.debug("User needs to complete phone verification");
                return { 
                  success: true, 
                  needsPhoneVerification: true,
                  phone: profile.phone,
                  verificationData: { 
                    accountType: profile.type,
                    name: profile.name,
                    address: profile.address,
                    city: profile.city,
                    state: profile.state,
                    zipCode: profile.zipcode
                  }
                };
              } else {
                // User exists but likely needs password setup (business account)
                authLogger.debug("User profile found but likely needs password setup");
                return {
                  success: false,
                  needsPasswordSetup: true,
                  error: "Account found but password not set. Please complete your registration by setting up your password.",
                  phone: profile.phone
                };
              }
            } else {
              // No profile found, this is a regular invalid login
              authLogger.debug("No profile found - regular invalid login");
              return { success: false, error: "Invalid email or password. Please try again." };
            }
          } catch (profileCheckError) {
            authLogger.error("Error checking profile for incomplete registration:", profileCheckError);
            // If profile check fails, still return the original error
            return { success: false, error: "Invalid email or password. Please try again." };
          }
        }

        return { success: false, error: error.message };
      }

      authLogger.info("Login successful");

      // Clear review cache on login to fetch fresh data
      sessionStorage.removeItem(`profileReviews_${data.user.id}`);

      return { success: true };
    } catch (error: any) {
      authLogger.error("Login error:", error);
      return { success: false, error: error.message || "An unexpected error occurred" };
    }
  };

  const signup = async (signupData: SignupData): Promise<{ success: boolean; error?: string }> => {
    authLogger.debug("Attempting signup for:", signupData.email);
    
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: signupData.name,
            type: signupData.type,
            first_name: signupData.firstName,
            last_name: signupData.lastName,
            phone: signupData.phone,
          }
        }
      });

      if (error) {
        authLogger.error("Signup error:", error);
        return { success: false, error: error.message };
      }

      authLogger.info("Signup successful");
      return { success: true };
    } catch (error: any) {
      authLogger.error("Signup error:", error);
      return { success: false, error: error.message };
    }
  };

  const logout = async (): Promise<void> => {
    authLogger.debug("Attempting logout");
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      authLogger.error("Logout error:", error);
      throw error;
    }

    // Clear local state
    setCurrentUser(null);
    setIsSubscribed(false);
    setOneTimeAccessResources([]);

    authLogger.info("Logout successful");
  };

  const updateProfile = async (updates: Partial<User>): Promise<void> => {
    if (!currentUser) {
      throw new Error("No user logged in");
    }

    authLogger.debug("Updating profile for:", currentUser.id);

    const { error } = await supabase
      .from('profiles')
      .update({
        name: updates.name,
        first_name: updates.firstName,
        last_name: updates.lastName,
        phone: updates.phone,
        address: updates.address,
        city: updates.city,
        state: updates.state,
        zipcode: updates.zipCode,
        bio: updates.bio,
        avatar: updates.avatar
      })
      .eq('id', currentUser.id);

    if (error) {
      authLogger.error("Profile update error:", error);
      throw error;
    }

    // Update local user state
    const updatedUser = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);

    authLogger.info("Profile updated successfully");
  };

  const hasOneTimeAccess = (resourceId: string): boolean => {
    return oneTimeAccessResources.includes(resourceId);
  };

  const markOneTimeAccess = async (resourceId: string): Promise<void> => {
    if (!hasOneTimeAccess(resourceId)) {
      setOneTimeAccessResources([...oneTimeAccessResources, resourceId]);
    }
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
