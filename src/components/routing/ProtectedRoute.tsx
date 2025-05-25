
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { currentUser, session, loading } = useAuth();
  
  // Show loading while auth state is being determined
  if (loading) {
    return <div>Loading...</div>;
  }
  
  // Redirect to login if no session
  if (!session?.user) {
    return <Navigate to="/login" replace />;
  }
  
  // If we have a session but no profile yet, show loading
  if (!currentUser) {
    return <div>Loading profile...</div>;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
