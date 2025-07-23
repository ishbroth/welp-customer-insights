
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import LoadingRoute from "./LoadingRoute";
import PrivateRoute from "./PrivateRoute";
import BusinessOrAdminRoute from "./BusinessOrAdminRoute";

// Import pages
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import BillingPage from "@/pages/BillingPage";
import ProfilePage from "@/pages/ProfilePage";

const AppRoutes = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/profile" element={
        <PrivateRoute>
          <ProfilePage />
        </PrivateRoute>
      } />
      
      <Route path="/profile/billing" element={
        <PrivateRoute>
          <BillingPage />
        </PrivateRoute>
      } />
      
      {/* Redirect any unknown routes to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
