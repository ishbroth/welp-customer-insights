
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LoadingContextType {
  isPageLoading: boolean;
  setIsPageLoading: (loading: boolean) => void;
  isInitialLoading: boolean;
  setIsInitialLoading: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  return (
    <LoadingContext.Provider value={{ isPageLoading, setIsPageLoading, isInitialLoading, setIsInitialLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
