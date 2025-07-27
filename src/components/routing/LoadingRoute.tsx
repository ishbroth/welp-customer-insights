
import React from 'react';

interface LoadingRouteProps {
  children: React.ReactNode;
}

const LoadingRoute: React.FC<LoadingRouteProps> = ({ children }) => {
  return <>{children}</>;
};

export default LoadingRoute;
