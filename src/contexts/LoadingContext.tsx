
import React, { createContext, useContext, useState, ReactNode, useRef } from 'react';

interface LoadingContextType {
  isPageLoading: boolean;
  showPageLoading: () => void;
  hidePageLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isPageLoading, setIsPageLoading] = useState(false);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLoadingRef = useRef(false);
  
  const showPageLoading = () => {
    console.log('🔄 showPageLoading called - current state:', isLoadingRef.current);
    
    // Clear any existing timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
    
    // If already loading, don't start another cycle
    if (isLoadingRef.current) {
      console.log('🔄 Already loading, skipping');
      return;
    }
    
    // Set loading state immediately and synchronously
    isLoadingRef.current = true;
    setIsPageLoading(true);
    console.log('🔄 Loading screen shown immediately');
    
    // Set timeout to hide loading after exactly 500ms
    loadingTimeoutRef.current = setTimeout(() => {
      console.log('🔄 Loading timeout completed, hiding loading screen');
      setIsPageLoading(false);
      isLoadingRef.current = false;
      loadingTimeoutRef.current = null;
    }, 500);
  };
  
  const hidePageLoading = () => {
    console.log('🔄 hidePageLoading called');
    
    // Clear timeout if it exists
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
    
    setIsPageLoading(false);
    isLoadingRef.current = false;
  };
  
  return (
    <LoadingContext.Provider value={{ isPageLoading, showPageLoading, hidePageLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
