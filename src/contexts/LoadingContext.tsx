
import React, { createContext, useContext, useState, useEffect } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  showPageLoading: () => void;
  showInitialLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

interface LoadingProviderProps {
  children: React.ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);

  // Show initial loading on first app load
  useEffect(() => {
    if (!hasInitiallyLoaded) {
      const timer = setTimeout(() => {
        setIsLoading(false);
        setHasInitiallyLoaded(true);
      }, 2000); // 2 seconds for initial load

      return () => clearTimeout(timer);
    }
  }, [hasInitiallyLoaded]);

  const showPageLoading = () => {
    if (hasInitiallyLoaded) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
      }, 1000); // 1 second for page transitions
    }
  };

  const showInitialLoading = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setHasInitiallyLoaded(true);
    }, 2000);
  };

  return (
    <LoadingContext.Provider value={{
      isLoading,
      setIsLoading,
      showPageLoading,
      showInitialLoading
    }}>
      {children}
    </LoadingContext.Provider>
  );
};
