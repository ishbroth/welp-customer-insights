
import { useAuth } from "@/contexts/auth";
import { useLoading } from "@/contexts/LoadingContext";
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

interface LoadingRouteProps {
  children: React.ReactNode;
}

const LoadingRoute = ({ children }: LoadingRouteProps) => {
  const { loading } = useAuth();
  const { isPageLoading, setIsPageLoading } = useLoading();
  const location = useLocation();
  const previousLocationRef = useRef<string>('');
  const hasInitiallyLoadedRef = useRef(false);
  const isInitialMountRef = useRef(true);

  useEffect(() => {
    const currentPath = location.pathname + location.search;
    console.log('🚀 LoadingRoute - Current path:', currentPath);
    console.log('🚀 LoadingRoute - Previous path:', previousLocationRef.current);
    console.log('🚀 LoadingRoute - Is initial mount:', isInitialMountRef.current);
    
    // On very first mount, just set the initial path and skip loading
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      previousLocationRef.current = currentPath;
      hasInitiallyLoadedRef.current = true;
      console.log('🚀 LoadingRoute - Initial mount, skipping loading');
      return;
    }

    // For all subsequent navigation, show loading if path changed
    if (hasInitiallyLoadedRef.current && previousLocationRef.current !== currentPath) {
      console.log('🚀 LoadingRoute - Route changed, triggering loading');
      setIsPageLoading(true);
      
      // Hide loading after a short delay to prevent flashing
      const timer = setTimeout(() => {
        setIsPageLoading(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
    
    previousLocationRef.current = currentPath;
  }, [location.pathname, location.search, setIsPageLoading]);
  
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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return <>{children}</>;
};

export default LoadingRoute;
