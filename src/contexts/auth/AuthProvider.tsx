
import React, { createContext, useContext, ReactNode } from "react";
import { User } from "@/types";
import { AuthContextType } from "./types";
import { useAuthState } from "./useAuthState";
import { useAuthMethods } from "./useAuthMethods";

// Create the Auth Context with a default value to prevent null context issues
const AuthContext = createContext<AuthContextType | null>(null);

// Auth Provider Component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  console.log("🔧 AuthProvider rendering");
  
  const authState = useAuthState();
  console.log("🔧 AuthState initialized:", !!authState);
  
  const {
    currentUser,
    setCurrentUser,
    session,
    loading,
    isSubscribed,
    setIsSubscribed,
    oneTimeAccessResources,
    setOneTimeAccessResources
  } = authState;

  const authMethods = useAuthMethods(setIsSubscribed, oneTimeAccessResources, setOneTimeAccessResources, currentUser, setCurrentUser);
  console.log("🔧 AuthMethods initialized:", !!authMethods);

  const {
    login,
    signup,
    logout,
    updateProfile,
    hasOneTimeAccess,
    markOneTimeAccess
  } = authMethods;

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

  console.log("🔧 AuthProvider value created:", !!value);

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
    console.error("❌ useAuth called outside of AuthProvider");
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
