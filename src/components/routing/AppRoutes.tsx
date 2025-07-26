
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import LoadingScreen from '@/components/LoadingScreen';
import { BusinessInfoForm } from '@/components/signup/BusinessInfoForm';
import ProfilePage from '@/pages/ProfilePage';
import HomePage from '@/pages/HomePage';
import SignUpPage from '@/pages/SignUpPage';
import LoginPage from '@/pages/LoginPage';
import EditProfilePage from '@/pages/EditProfilePage';
import AdminVerifyBusiness from '@/pages/AdminVerifyBusiness';
import VerificationDebug from "@/pages/VerificationDebug";

const AppRoutes = () => {
  const { currentUser, loading } = useAuth();
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    if (!loading) {
      setIsPageLoading(false);
    }
  }, [loading]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={currentUser ? <Navigate to="/profile" /> : <SignUpPage />} />
        <Route path="/login" element={currentUser ? <Navigate to="/profile" /> : <LoginPage />} />
        <Route path="/profile" element={currentUser ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="/edit-profile" element={currentUser ? <EditProfilePage /> : <Navigate to="/login" />} />
        <Route path="/business-info" element={currentUser ? <BusinessInfoForm 
          businessName=""
          setBusinessName={() => {}}
          businessEmail=""
          setBusinessEmail={() => {}}
          businessStreet=""
          setBusinessStreet={() => {}}
          businessApartmentSuite=""
          setBusinessApartmentSuite={() => {}}
          businessCity=""
          setBusinessCity={() => {}}
          businessState=""
          setBusinessState={() => {}}
          businessZipCode=""
          setBusinessZipCode={() => {}}
          businessPhone=""
          setBusinessPhone={() => {}}
          businessType=""
          setBusinessType={() => {}}
          licenseNumber=""
          setLicenseNumber={() => {}}
        /> : <Navigate to="/login" />} />
        <Route path="/admin/verify-business" element={<AdminVerifyBusiness />} />
        <Route path="/debug/verification" element={<VerificationDebug />} />
      </Routes>
      
      {isPageLoading && <LoadingScreen />}
    </Router>
  );
};

export default AppRoutes;
