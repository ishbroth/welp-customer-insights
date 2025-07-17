
import React, { useEffect } from 'react';
import { useLoading } from '@/contexts/LoadingContext';

interface LoadingRouteProps {
  children: React.ReactNode;
}

const LoadingRoute: React.FC<LoadingRouteProps> = ({ children }) => {
  const { showPageLoading } = useLoading();

  useEffect(() => {
    showPageLoading();
  }, [showPageLoading]);

  return <>{children}</>;
};

export default LoadingRoute;
