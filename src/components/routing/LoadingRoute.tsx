
import { useAuth } from "@/contexts/auth";

interface LoadingRouteProps {
  children: React.ReactNode;
}

const LoadingRoute = ({ children }: LoadingRouteProps) => {
  const { loading } = useAuth();
  
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
