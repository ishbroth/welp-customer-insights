
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import WelpLoadingIcon from "@/components/ui/WelpLoadingIcon";

interface BusinessOwnerRouteProps {
  children: React.ReactNode;
}

const BusinessOwnerRoute = ({ children }: BusinessOwnerRouteProps) => {
  const { currentUser, session, loading } = useAuth();
  
  // Show loading while auth state is being determined
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <WelpLoadingIcon size={48} />
      </div>
    );
  }
  
  // Redirect to login if not logged in
  if (!session?.user) {
    return <Navigate to="/login" replace />;
  }
  
  // Allow access if we have a session but profile is still loading
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <WelpLoadingIcon size={48} showText={true} text="Loading profile..." />
      </div>
    );
  }
  
  // Redirect if not a business owner
  if (currentUser.type === "customer") {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

export default BusinessOwnerRoute;
