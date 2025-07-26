
import React, { useState, useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import LoadingScreen from '@/components/LoadingScreen';
import { BusinessInfoForm } from '@/components/signup/BusinessInfoForm';
import ProfilePage from '@/pages/ProfilePage';
import AdminVerifyBusiness from '@/pages/AdminVerifyBusiness';
import VerificationDebug from "@/pages/VerificationDebug";

// Simple placeholder components for missing pages
const HomePage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <h1 className="text-2xl font-bold">Welcome to Welp</h1>
  </div>
);

const SignUpPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <h1 className="text-2xl font-bold">Sign Up Page</h1>
  </div>
);

const LoginPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <h1 className="text-2xl font-bold">Login Page</h1>
  </div>
);

const EditProfilePage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <h1 className="text-2xl font-bold">Edit Profile Page</h1>
  </div>
);

const AppRoutes = () => {
  const { currentUser, loading } = useAuth();
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    if (!loading) {
      setIsPageLoading(false);
    }
  }, [loading]);

  return (
    <>
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
    </>
  );
};

export default AppRoutes;
