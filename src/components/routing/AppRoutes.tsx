
import { Routes, Route } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import LoadingRoute from "./LoadingRoute";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ProfilePage from "@/pages/ProfilePage";
import ProfileEdit from "@/pages/ProfileEdit";
import ProfileReviews from "@/pages/ProfileReviews";
import SearchResults from "@/pages/SearchResults";
import NewReview from "@/pages/NewReview";
import ReviewSuccess from "@/pages/ReviewSuccess";
import CustomerProfile from "@/pages/CustomerProfile";
import BusinessProfile from "@/pages/BusinessProfile";
import BusinessReviews from "@/pages/BusinessReviews";
import VerifyPhone from "@/pages/VerifyPhone";
import VerifyEmail from "@/pages/VerifyEmail";
import BusinessPasswordSetup from "@/pages/BusinessPasswordSetup";
import Verification from "@/pages/Verification";
import VerifyLicense from "@/pages/VerifyLicense";
import AdminLogin from "@/pages/AdminLogin";
import AdminVerifyBusiness from "@/pages/AdminVerifyBusiness";
import BusinessVerificationSuccess from "@/pages/BusinessVerificationSuccess";
import CustomerVerification from "@/pages/CustomerVerification";
import Subscription from "@/pages/Subscription";
import BuyCredits from "@/pages/BuyCredits";
import BillingPage from "@/pages/BillingPage";
import NotificationsPage from "@/pages/NotificationsPage";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import ReportReview from "@/pages/ReportReview";
import FAQ from "@/pages/FAQ";
import About from "@/pages/About";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import HowItWorks from "@/pages/HowItWorks";
import CustomerBenefits from "@/pages/CustomerBenefits";
import CustomerStories from "@/pages/CustomerStories";
import SuccessStories from "@/pages/SuccessStories";
import VerificationResources from "@/pages/VerificationResources";
import TwilioDebug from "@/pages/TwilioDebug";
import AppIconPreviewPage from "@/pages/AppIconPreview";
import AppStoreAssetsPage from "@/pages/AppStoreAssets";
import NotFound from "@/pages/NotFound";
import ProtectedRoute from "./ProtectedRoute";
import BusinessOwnerRoute from "./BusinessOwnerRoute";
import BusinessOrAdminRoute from "./BusinessOrAdminRoute";

const AppRoutes = () => {
  const { currentUser } = useAuth();

  return (
    <Routes>
      {/* Public Routes - wrapped with LoadingRoute for page transitions */}
      <Route path="/" element={<LoadingRoute><Index /></LoadingRoute>} />
      <Route path="/login" element={<LoadingRoute><Login /></LoadingRoute>} />
      <Route path="/signup" element={<LoadingRoute><Signup /></LoadingRoute>} />
      <Route path="/forgot-password" element={<LoadingRoute><ForgotPassword /></LoadingRoute>} />
      <Route path="/reset-password" element={<LoadingRoute><ResetPassword /></LoadingRoute>} />
      <Route path="/search" element={<LoadingRoute><SearchResults /></LoadingRoute>} />
      <Route path="/customer/:id" element={<LoadingRoute><CustomerProfile /></LoadingRoute>} />
      <Route path="/business/:id" element={<LoadingRoute><BusinessProfile /></LoadingRoute>} />
      <Route path="/business/:id/reviews" element={<LoadingRoute><BusinessReviews /></LoadingRoute>} />
      <Route path="/verify-phone" element={<LoadingRoute><VerifyPhone /></LoadingRoute>} />
      <Route path="/verify-email" element={<LoadingRoute><VerifyEmail /></LoadingRoute>} />
      <Route path="/business-password-setup" element={<LoadingRoute><BusinessPasswordSetup /></LoadingRoute>} />
      <Route path="/verification" element={<LoadingRoute><Verification /></LoadingRoute>} />
      <Route path="/verify-license" element={<LoadingRoute><VerifyLicense /></LoadingRoute>} />
      <Route path="/admin/login" element={<LoadingRoute><AdminLogin /></LoadingRoute>} />
      <Route path="/admin/verify-business" element={<LoadingRoute><AdminVerifyBusiness /></LoadingRoute>} />
      <Route path="/business-verification-success" element={<LoadingRoute><BusinessVerificationSuccess /></LoadingRoute>} />
      <Route path="/customer-verification" element={<LoadingRoute><CustomerVerification /></LoadingRoute>} />
      <Route path="/subscription" element={<LoadingRoute><Subscription /></LoadingRoute>} />
      <Route path="/buy-credits" element={<LoadingRoute><BuyCredits /></LoadingRoute>} />
      <Route path="/report-review/:reviewId" element={<LoadingRoute><ReportReview /></LoadingRoute>} />
      <Route path="/faq" element={<LoadingRoute><FAQ /></LoadingRoute>} />
      <Route path="/about" element={<LoadingRoute><About /></LoadingRoute>} />
      <Route path="/terms" element={<LoadingRoute><Terms /></LoadingRoute>} />
      <Route path="/privacy" element={<LoadingRoute><Privacy /></LoadingRoute>} />
      <Route path="/how-it-works" element={<LoadingRoute><HowItWorks /></LoadingRoute>} />
      <Route path="/customer-benefits" element={<LoadingRoute><CustomerBenefits /></LoadingRoute>} />
      <Route path="/customer-stories" element={<LoadingRoute><CustomerStories /></LoadingRoute>} />
      <Route path="/success-stories" element={<LoadingRoute><SuccessStories /></LoadingRoute>} />
      <Route path="/verification-resources" element={<LoadingRoute><VerificationResources /></LoadingRoute>} />
      <Route path="/twilio-debug" element={<LoadingRoute><TwilioDebug /></LoadingRoute>} />
      
      {/* App Store Assets Routes */}
      <Route path="/app-icon-preview" element={<LoadingRoute><AppIconPreviewPage /></LoadingRoute>} />
      <Route path="/app-store-assets" element={<LoadingRoute><AppStoreAssetsPage /></LoadingRoute>} />

      {/* Protected Routes - wrapped with LoadingRoute for page transitions */}
      <Route
        path="/profile"
        element={
          <LoadingRoute>
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          </LoadingRoute>
        }
      />
      <Route
        path="/profile/edit"
        element={
          <LoadingRoute>
            <ProtectedRoute>
              <ProfileEdit />
            </ProtectedRoute>
          </LoadingRoute>
        }
      />
      <Route
        path="/profile/reviews"
        element={
          <LoadingRoute>
            <ProtectedRoute>
              <ProfileReviews />
            </ProtectedRoute>
          </LoadingRoute>
        }
      />
      <Route
        path="/review/new"
        element={
          <LoadingRoute>
            <ProtectedRoute>
              <NewReview />
            </ProtectedRoute>
          </LoadingRoute>
        }
      />
      <Route
        path="/review/success"
        element={
          <LoadingRoute>
            <ProtectedRoute>
              <ReviewSuccess />
            </ProtectedRoute>
          </LoadingRoute>
        }
      />
      <Route
        path="/billing"
        element={
          <LoadingRoute>
            <ProtectedRoute>
              <BillingPage />
            </ProtectedRoute>
          </LoadingRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <LoadingRoute>
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          </LoadingRoute>
        }
      />

      {/* Catch all route */}
      <Route path="*" element={<LoadingRoute><NotFound /></LoadingRoute>} />
    </Routes>
  );
};

export default AppRoutes;
