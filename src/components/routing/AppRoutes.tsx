
import React, { useState, useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import LoadingScreen from '@/components/LoadingScreen';
import { BusinessInfoForm } from '@/components/signup/BusinessInfoForm';
import ProfilePage from '@/pages/ProfilePage';
import AdminVerifyBusiness from '@/pages/AdminVerifyBusiness';
import VerificationDebug from "@/pages/VerificationDebug";
import Index from '@/pages/Index';
import About from '@/pages/About';
import HowItWorks from '@/pages/HowItWorks';
import Login from '@/pages/Login';
import EmailVerificationSuccess from '@/pages/EmailVerificationSuccess';
import BusinessReviews from '@/pages/BusinessReviews';
import NotFound from '@/pages/NotFound';
import PrivateRoute from './PrivateRoute';
import BusinessOrAdminRoute from './BusinessOrAdminRoute';

// Simple placeholder components for missing pages that need to be created
const SignUpPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <h1 className="text-2xl font-bold">Sign Up Page</h1>
  </div>
);

const EditProfilePage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <h1 className="text-2xl font-bold">Edit Profile Page</h1>
  </div>
);

const SearchPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <h1 className="text-2xl font-bold">Search Page</h1>
  </div>
);

const FAQPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <h1 className="text-2xl font-bold">FAQ Page</h1>
  </div>
);

const TermsPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <h1 className="text-2xl font-bold">Terms of Service</h1>
  </div>
);

const PrivacyPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <h1 className="text-2xl font-bold">Privacy Policy</h1>
  </div>
);

const VerificationPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <h1 className="text-2xl font-bold">Business Verification</h1>
  </div>
);

const SubscriptionPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <h1 className="text-2xl font-bold">Subscription Benefits</h1>
  </div>
);

const SuccessStoriesPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <h1 className="text-2xl font-bold">Success Stories</h1>
  </div>
);

const CustomerVerificationPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <h1 className="text-2xl font-bold">Customer Verification</h1>
  </div>
);

const CustomerBenefitsPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <h1 className="text-2xl font-bold">Customer Subscription Benefits</h1>
  </div>
);

const CustomerStoriesPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <h1 className="text-2xl font-bold">Customer Success Stories</h1>
  </div>
);

const VerifyEmailPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <h1 className="text-2xl font-bold">Verify Email</h1>
  </div>
);

const TestimonialsPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <h1 className="text-2xl font-bold">Testimonials</h1>
  </div>
);

const PostReviewPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <h1 className="text-2xl font-bold">Post Review</h1>
  </div>
);

const NotificationsPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <h1 className="text-2xl font-bold">Notifications</h1>
  </div>
);

const BillingPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <h1 className="text-2xl font-bold">Billing</h1>
  </div>
);

const UserReviewsPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <h1 className="text-2xl font-bold">My Reviews</h1>
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
        {/* Public Routes */}
        <Route path="/" element={<Index />} />
        <Route path="/about" element={<About />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/signup" element={currentUser ? <Navigate to="/profile" /> : <SignUpPage />} />
        <Route path="/login" element={currentUser ? <Navigate to="/profile" /> : <Login />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/email-verification-success" element={<EmailVerificationSuccess />} />
        <Route path="/customer-benefits" element={<CustomerBenefitsPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/verification" element={<VerificationPage />} />
        <Route path="/subscription" element={<SubscriptionPage />} />
        <Route path="/success-stories" element={<SuccessStoriesPage />} />
        <Route path="/customer-verification" element={<CustomerVerificationPage />} />
        <Route path="/customer-stories" element={<CustomerStoriesPage />} />
        <Route path="/testimonials" element={<TestimonialsPage />} />

        {/* Protected Routes */}
        <Route path="/profile" element={
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        } />
        <Route path="/profile/edit" element={
          <PrivateRoute>
            <EditProfilePage />
          </PrivateRoute>
        } />
        <Route path="/profile/reviews" element={
          <PrivateRoute>
            <UserReviewsPage />
          </PrivateRoute>
        } />
        <Route path="/profile/business-reviews" element={
          <PrivateRoute>
            <BusinessReviews />
          </PrivateRoute>
        } />
        <Route path="/profile/billing" element={
          <PrivateRoute>
            <BillingPage />
          </PrivateRoute>
        } />
        <Route path="/notifications" element={
          <PrivateRoute>
            <NotificationsPage />
          </PrivateRoute>
        } />
        <Route path="/review/new" element={
          <BusinessOrAdminRoute>
            <PostReviewPage />
          </BusinessOrAdminRoute>
        } />

        {/* Business Routes */}
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

        {/* Admin Routes */}
        <Route path="/admin/verify-business" element={<AdminVerifyBusiness />} />
        <Route path="/debug/verification" element={<VerificationDebug />} />

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      {isPageLoading && <LoadingScreen />}
    </>
  );
};

export default AppRoutes;
