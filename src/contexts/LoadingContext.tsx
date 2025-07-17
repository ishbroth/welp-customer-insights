
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

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
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear any existing timeout when component unmounts
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  // Show initial loading on first app load only
  useEffect(() => {
    if (!hasInitiallyLoaded) {
      console.log('🔄 Starting initial loading...');
      setIsLoading(true);
      
      loadingTimeoutRef.current = setTimeout(() => {
        console.log('✅ Initial loading complete');
        setIsLoading(false);
        setHasInitiallyLoaded(true);
      }, 2000); // 2 seconds for initial load
    }
  }, [hasInitiallyLoaded]);

  const showPageLoading = () => {
    // Only show page loading if we've already done initial load
    if (hasInitiallyLoaded) {
      console.log('🔄 Starting page transition loading...');
      
      // Clear any existing timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      
      setIsLoading(true);
      loadingTimeoutRef.current = setTimeout(() => {
        console.log('✅ Page transition loading complete');
        setIsLoading(false);
      }, 500); // 0.5 seconds for page transitions
    }
  };

  const showInitialLoading = () => {
    console.log('🔄 Manually triggering initial loading...');
    
    // Clear any existing timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
    
    setIsLoading(true);
    loadingTimeoutRef.current = setTimeout(() => {
      console.log('✅ Manual initial loading complete');
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
