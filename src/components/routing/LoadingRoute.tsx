
import { useAuth } from "@/contexts/auth";
import { useLoading } from "@/contexts/LoadingContext";
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

interface LoadingRouteProps {
  children: React.ReactNode;
}

const LoadingRoute = ({ children }: LoadingRouteProps) => {
  const { loading } = useAuth();
  const { showPageLoading } = useLoading();
  const location = useLocation();
  const previousLocationRef = useRef<string>('');
  const hasInitiallyLoadedRef = useRef(false);

  useEffect(() => {
    const currentPath = location.pathname + location.search;
    console.log('🚀 LoadingRoute - Current path:', currentPath);
    console.log('🚀 LoadingRoute - Previous path:', previousLocationRef.current);
    
    // Skip initial load
    if (!hasInitiallyLoadedRef.current) {
      hasInitiallyLoadedRef.current = true;
      previousLocationRef.current = currentPath;
      console.log('🚀 LoadingRoute - Skipping initial load');
      return;
    }

    // Only trigger loading on actual route changes
    if (previousLocationRef.current !== currentPath) {
      console.log('🚀 LoadingRoute - Triggering page loading animation');
      showPageLoading();
    }
    
    previousLocationRef.current = currentPath;
  }, [location.pathname, location.search, showPageLoading]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return <>{children}</>;
};

export default LoadingRoute;
