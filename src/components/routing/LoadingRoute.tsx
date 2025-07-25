
import { useAuth } from "@/contexts/auth";
import { useLoading } from "@/contexts/LoadingContext";
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Capacitor } from '@capacitor/core';

interface LoadingRouteProps {
  children: React.ReactNode;
}

const LoadingRoute = ({ children }: LoadingRouteProps) => {
  const { loading } = useAuth();
  const { showPageLoading, isPageLoading } = useLoading();
  const location = useLocation();
  const previousLocationRef = useRef<string>('');
  const hasInitiallyLoadedRef = useRef(false);
  const isInitialMountRef = useRef(true);

  useEffect(() => {
    const currentPath = location.pathname + location.search;
    const isNative = Capacitor.isNativePlatform();
    
    console.log('🚀 LoadingRoute - Current path:', currentPath);
    console.log('🚀 LoadingRoute - Previous path:', previousLocationRef.current);
    console.log('🚀 LoadingRoute - Is initial mount:', isInitialMountRef.current);
    console.log('🚀 LoadingRoute - Is native platform:', isNative);
    
    // On very first mount, show loading for native apps or homepage
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      previousLocationRef.current = currentPath;
      
      // Show loading screen for native apps or homepage on initial load
      if (isNative || currentPath === '/' || currentPath === '') {
        console.log('🚀 LoadingRoute - Initial load, showing loading screen');
        showPageLoading();
      } else {
        console.log('🚀 LoadingRoute - Initial mount, skipping loading');
      }
      
      hasInitiallyLoadedRef.current = true;
      return;
    }

    // For all subsequent navigation, show loading if path changed
    if (hasInitiallyLoadedRef.current && previousLocationRef.current !== currentPath) {
      console.log('🚀 LoadingRoute - Route changed, triggering loading');
      showPageLoading();
    }
    
    previousLocationRef.current = currentPath;
  }, [location.pathname, location.search, showPageLoading]);
  
  // Show auth loading spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If page loading is active, don't render children to prevent flashing
  if (isPageLoading) {
    return null;
  }
  
  return <>{children}</>;
};

export default LoadingRoute;
