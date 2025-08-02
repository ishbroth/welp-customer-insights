
import React from 'react';
import { useAuth } from '@/contexts/auth';
import { Navigate } from 'react-router-dom';
import WelpLoadingIcon from '@/components/ui/WelpLoadingIcon';

interface BusinessOrAdminRouteProps {
  children: React.ReactNode;
}

const BusinessOrAdminRoute: React.FC<BusinessOrAdminRouteProps> = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <WelpLoadingIcon size={48} />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.type !== 'business' && currentUser.type !== 'admin') {
    return <Navigate to="/profile" replace />;
  }

  return <>{children}</>;
};

export default BusinessOrAdminRoute;
