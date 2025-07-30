/*
BACKUP FILE - AuthProvider.tsx as of 2025-01-30
This is a backup copy for reference purposes

import React, { createContext, useContext, useEffect } from 'react';
import { AuthContextType } from './types';
import { useAuthStateManagement } from './hooks/useAuthStateManagement';
import { useAuthMethods } from './hooks/useAuthMethods';
import { useAuthSessionManager } from './hooks/useAuthSessionManager';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  const {
    login,
    signup,
    logout,
    updateProfile
  } = useAuthMethods({
    setCurrentUser,
    setSession,
    setLoading,
    setIsSubscribed,
    setOneTimeAccessResources
  });

  useAuthSessionManager({
    setCurrentUser,
    setSession,
    setLoading,
    setIsSubscribed,
    setOneTimeAccessResources
  });

  const hasOneTimeAccess = (resourceId: string): boolean => {
    return oneTimeAccessResources.includes(resourceId);
  };

  const markOneTimeAccess = async (resourceId: string): Promise<void> => {
    if (!hasOneTimeAccess(resourceId)) {
      setOneTimeAccessResources(prev => [...prev, resourceId]);
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
*/