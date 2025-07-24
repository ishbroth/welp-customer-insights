
import React, { createContext, useContext, useState, ReactNode, useRef } from 'react';

interface LoadingContextType {
  isPageLoading: boolean;
  showPageLoading: () => void;
  hidePageLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isPageLoading, setIsPageLoading] = useState(false);
  const isPageLoadingRef = useRef(false);
  
  const showPageLoading = () => {
    if (isPageLoadingRef.current) return;
    
    isPageLoadingRef.current = true;
    setIsPageLoading(true);
    
    setTimeout(() => {
      setIsPageLoading(false);
      isPageLoadingRef.current = false;
    }, 500); // Back to 500ms
  };
  
  const hidePageLoading = () => {
    setIsPageLoading(false);
    isPageLoadingRef.current = false;
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
