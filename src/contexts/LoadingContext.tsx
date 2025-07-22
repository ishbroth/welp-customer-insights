
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LoadingContextType {
  isPageLoading: boolean;
  showPageLoading: () => void;
  hidePageLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isPageLoading, setIsPageLoading] = useState(false);
  
  // Automatically hide loading after a timeout
  const showPageLoading = () => {
    setIsPageLoading(true);
    setTimeout(() => setIsPageLoading(false), 1000); // Auto-hide after 1 second
  };
  
  const hidePageLoading = () => setIsPageLoading(false);
  
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
