
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import WelpLoadingIcon from "@/components/ui/WelpLoadingIcon";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { currentUser, session, loading } = useAuth();
  
  // Show loading while auth state is being determined
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <WelpLoadingIcon size={48} />
      </div>
    );
  }
  
  // Redirect to login if no session
  if (!session?.user) {
    return <Navigate to="/login" replace />;
  }
  
  // If we have a session but no profile yet, show loading
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <WelpLoadingIcon size={48} showText={true} text="Loading profile..." />
      </div>
    );
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
