
import { Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ProfilePage from "@/pages/ProfilePage";
import ProfileEdit from "@/pages/ProfileEdit";
import SearchResults from "@/pages/SearchResults";
import NewReview from "@/pages/NewReview";
import ReviewSuccess from "@/pages/ReviewSuccess";
import BusinessProfile from "@/pages/BusinessProfile";
import CustomerProfile from "@/pages/CustomerProfile";
import BusinessReviews from "@/pages/BusinessReviews";
import ProfileReviews from "@/pages/ProfileReviews";
import ReportReview from "@/pages/ReportReview";
import Subscription from "@/pages/Subscription";
import BuyCredits from "@/pages/BuyCredits";
import OneTimeReviewAccess from "@/pages/OneTimeReviewAccess";
import BillingPage from "@/pages/BillingPage";
import NotificationsPage from "@/pages/NotificationsPage";
import Verification from "@/pages/Verification";
import BusinessVerificationSuccess from "@/pages/BusinessVerificationSuccess";
import BusinessPasswordSetup from "@/pages/BusinessPasswordSetup";
import CustomerVerification from "@/pages/CustomerVerification";
import VerifyPhone from "@/pages/VerifyPhone";
import VerifyLicense from "@/pages/VerifyLicense";
import AdminLogin from "@/pages/AdminLogin";
import AdminVerifyBusiness from "@/pages/AdminVerifyBusiness";
import HowItWorks from "@/pages/HowItWorks";
import About from "@/pages/About";
import FAQ from "@/pages/FAQ";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import CustomerBenefits from "@/pages/CustomerBenefits";
import CustomerStories from "@/pages/CustomerStories";
import SuccessStories from "@/pages/SuccessStories";
import VerificationResources from "@/pages/VerificationResources";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import NotFound from "@/pages/NotFound";
import ProtectedRoute from "./ProtectedRoute";
import BusinessOwnerRoute from "./BusinessOwnerRoute";
import BusinessOrAdminRoute from "./BusinessOrAdminRoute";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/search" element={<SearchResults />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/about" element={<About />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/customer-benefits" element={<CustomerBenefits />} />
      <Route path="/customer-stories" element={<CustomerStories />} />
      <Route path="/success-stories" element={<SuccessStories />} />
      <Route path="/verification-resources" element={<VerificationResources />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/verify-business" element={<AdminVerifyBusiness />} />

      {/* Protected routes */}
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/profile/edit" element={<ProtectedRoute><ProfileEdit /></ProtectedRoute>} />
      <Route path="/profile/reviews" element={<ProtectedRoute><ProfileReviews /></ProtectedRoute>} />
      <Route path="/profile/business-reviews" element={<BusinessOrAdminRoute><BusinessReviews /></BusinessOrAdminRoute>} />
      <Route path="/report-review" element={<ProtectedRoute><ReportReview /></ProtectedRoute>} />
      <Route path="/subscription" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
      <Route path="/buy-credits" element={<ProtectedRoute><BuyCredits /></ProtectedRoute>} />
      <Route path="/one-time-review" element={<ProtectedRoute><OneTimeReviewAccess /></ProtectedRoute>} />
      <Route path="/billing" element={<ProtectedRoute><BillingPage /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
      <Route path="/verification" element={<ProtectedRoute><Verification /></ProtectedRoute>} />
      <Route path="/customer-verification" element={<ProtectedRoute><CustomerVerification /></ProtectedRoute>} />
      <Route path="/verify-phone" element={<ProtectedRoute><VerifyPhone /></ProtectedRoute>} />
      <Route path="/verify-license" element={<ProtectedRoute><VerifyLicense /></ProtectedRoute>} />
      <Route path="/verification-success" element={<ProtectedRoute><BusinessVerificationSuccess /></ProtectedRoute>} />
      <Route path="/business-password-setup" element={<ProtectedRoute><BusinessPasswordSetup /></ProtectedRoute>} />

      {/* Business routes */}
      <Route path="/new-review" element={<BusinessOwnerRoute><NewReview /></BusinessOwnerRoute>} />
      <Route path="/review/success" element={<BusinessOwnerRoute><ReviewSuccess /></BusinessOwnerRoute>} />
      <Route path="/business/reviews" element={<BusinessOrAdminRoute><BusinessReviews /></BusinessOrAdminRoute>} />
      <Route path="/business/:businessId" element={<BusinessProfile />} />
      <Route path="/customer/:customerId" element={<CustomerProfile />} />

      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
