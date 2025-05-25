
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";

interface BusinessOrAdminRouteProps {
  children: React.ReactNode;
}

const BusinessOrAdminRoute = ({ children }: BusinessOrAdminRouteProps) => {
  const { currentUser, session, loading } = useAuth();
  
  // Show loading while auth state is being determined
  if (loading) {
    return <div>Loading...</div>;
  }
  
  // Redirect to login if not logged in
  if (!session?.user) {
    return <Navigate to="/login" replace />;
  }
  
  // Allow access if we have a session but profile is still loading
  if (!currentUser) {
    return <div>Loading profile...</div>;
  }
  
  // Redirect if not a business owner or admin
  if (currentUser.type === "customer") {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

export default BusinessOrAdminRoute;
