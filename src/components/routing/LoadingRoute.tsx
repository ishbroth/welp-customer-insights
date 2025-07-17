
import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useLoading } from '@/contexts/LoadingContext';

interface LoadingRouteProps {
  children: React.ReactNode;
}

const LoadingRoute: React.FC<LoadingRouteProps> = ({ children }) => {
  const { showPageLoading } = useLoading();
  const location = useLocation();
  const previousLocationRef = useRef<string>('');

  useEffect(() => {
    // Only trigger loading if the location actually changed
    const currentPath = location.pathname + location.search;
    if (previousLocationRef.current !== currentPath && previousLocationRef.current !== '') {
      console.log(`📍 Route changed from ${previousLocationRef.current} to ${currentPath} - triggering page loading`);
      showPageLoading();
    }
    previousLocationRef.current = currentPath;
  }, [location.pathname, location.search, showPageLoading]);

  return <>{children}</>;
};

export default LoadingRoute;
