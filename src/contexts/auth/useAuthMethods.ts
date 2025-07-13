
import React from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { SignupData } from "./types";

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
  const login = async (email: string, password: string) => {
    console.log("🔐 Attempting login for:", email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("❌ Login error:", error);
      throw error;
    }

    console.log("✅ Login successful");
    return { user: data.user, session: data.session };
  };

  const signup = async (signupData: SignupData) => {
    console.log("📝 Attempting signup for:", signupData.email);
    
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
      console.error("❌ Signup error:", error);
      throw error;
    }

    console.log("✅ Signup successful");
    return { user: data.user, session: data.session };
  };

  const logout = async () => {
    console.log("🚪 Attempting logout");
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error("❌ Logout error:", error);
      throw error;
    }

    // Clear local state
    setCurrentUser(null);
    setIsSubscribed(false);
    setOneTimeAccessResources([]);
    
    console.log("✅ Logout successful");
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!currentUser) {
      throw new Error("No user logged in");
    }

    console.log("📝 Updating profile for:", currentUser.id);

    const { error } = await supabase
      .from('profiles')
      .update({
        name: updates.name,
        first_name: updates.first_name,
        last_name: updates.last_name,
        phone: updates.phone,
        address: updates.address,
        city: updates.city,
        state: updates.state,
        zipcode: updates.zipcode,
        bio: updates.bio,
        avatar: updates.avatar
      })
      .eq('id', currentUser.id);

    if (error) {
      console.error("❌ Profile update error:", error);
      throw error;
    }

    // Update local user state
    const updatedUser = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);
    
    console.log("✅ Profile updated successfully");
    return updatedUser;
  };

  const hasOneTimeAccess = (resourceId: string): boolean => {
    return oneTimeAccessResources.includes(resourceId);
  };

  const markOneTimeAccess = (resourceId: string) => {
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
