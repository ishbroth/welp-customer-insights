
import React from 'react';

interface LoadingRouteProps {
  children: React.ReactNode;
}

const LoadingRoute: React.FC<LoadingRouteProps> = ({ children }) => {
  // Disabled loading trigger to prevent conflicts with initial loading
  // Just render children directly for now
  return <>{children}</>;
};

export default LoadingRoute;
