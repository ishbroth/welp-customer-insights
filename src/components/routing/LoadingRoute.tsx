
import React, { useEffect, useRef } from 'react';
import { useLoading } from '@/contexts/LoadingContext';

interface LoadingRouteProps {
  children: React.ReactNode;
}

const LoadingRoute: React.FC<LoadingRouteProps> = ({ children }) => {
  const { showPageLoading } = useLoading();
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    // Only trigger loading once per route change
    if (!hasTriggeredRef.current) {
      console.log('📍 LoadingRoute mounted - triggering page loading');
      showPageLoading();
      hasTriggeredRef.current = true;
    }

    // Reset the flag when component unmounts
    return () => {
      hasTriggeredRef.current = false;
    };
  }, [showPageLoading]);

  return <>{children}</>;
};

export default LoadingRoute;
