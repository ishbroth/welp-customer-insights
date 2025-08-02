
import React from 'react';
import { useAuth } from '@/contexts/auth';
import { Navigate } from 'react-router-dom';
import WelpLoadingIcon from '@/components/ui/WelpLoadingIcon';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <WelpLoadingIcon size={48} />
      </div>
    );
  }

  return currentUser ? <>{children}</> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
