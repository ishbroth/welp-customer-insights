import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import LoadingScreen from '@/components/LoadingScreen';
import BusinessInfoForm from '@/components/signup/BusinessInfoForm';
import ProfilePage from '@/pages/ProfilePage';
import HomePage from '@/pages/HomePage';
import SignUpPage from '@/pages/SignUpPage';
import LoginPage from '@/pages/LoginPage';
import EditProfilePage from '@/pages/EditProfilePage';
import AdminVerifyBusiness from '@/pages/AdminVerifyBusiness';
import VerificationDebug from "@/pages/VerificationDebug";

const AppRoutes = () => {
  const { isSignedIn, isLoaded } = useUser();
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    if (isLoaded) {
      setIsPageLoading(false);
    }
  }, [isLoaded]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={isSignedIn ? <Navigate to="/profile" /> : <SignUpPage />} />
        <Route path="/login" element={isSignedIn ? <Navigate to="/profile" /> : <LoginPage />} />
        <Route path="/profile" element={isSignedIn ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="/edit-profile" element={isSignedIn ? <EditProfilePage /> : <Navigate to="/login" />} />
        <Route path="/business-info" element={isSignedIn ? <BusinessInfoForm /> : <Navigate to="/login" />} />
        <Route path="/admin/verify-business" element={<AdminVerifyBusiness />} />
        <Route path="/debug/verification" element={<VerificationDebug />} />
      </Routes>
      
      {isPageLoading && <LoadingScreen />}
    </Router>
  );
};

export default AppRoutes;
