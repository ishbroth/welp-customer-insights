
import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useLoading } from '@/contexts/LoadingContext';

interface LoadingRouteProps {
  children: React.ReactNode;
}

const LoadingRoute: React.FC<LoadingRouteProps> = ({ children }) => {
  const location = useLocation();
  const previousLocationRef = useRef<string>('');
  const { setIsPageLoading } = useLoading();
  const isPageLoadingRef = useRef(false);

  const showPageLoading = () => {
    if (isPageLoadingRef.current) return; // Prevent multiple simultaneous loads
    
    isPageLoadingRef.current = true;
    setIsPageLoading(true);
    
    // Hide loading screen after 500ms for page transitions
    setTimeout(() => {
      setIsPageLoading(false);
      isPageLoadingRef.current = false;
    }, 500);
  };

  useEffect(() => {
    const currentPath = location.pathname + location.search;
    
    // Only trigger loading on actual navigation (not initial load)
    if (previousLocationRef.current !== currentPath && previousLocationRef.current !== '') {
      console.log('📍 LoadingRoute: Page transition detected', {
        from: previousLocationRef.current,
        to: currentPath
      });
      showPageLoading();
    }
    
    previousLocationRef.current = currentPath;
  }, [location.pathname, location.search]);

  return <>{children}</>;
};

export default LoadingRoute;
