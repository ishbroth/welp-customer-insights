
import { Routes, Route } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
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
      {/* Public Routes */}
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/search" element={<SearchResults />} />
      <Route path="/customer/:id" element={<CustomerProfile />} />
      <Route path="/business/:id" element={<BusinessProfile />} />
      <Route path="/business/:id/reviews" element={<BusinessReviews />} />
      <Route path="/verify-phone" element={<VerifyPhone />} />
      <Route path="/business-password-setup" element={<BusinessPasswordSetup />} />
      <Route path="/verification" element={<Verification />} />
      <Route path="/verify-license" element={<VerifyLicense />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/verify-business" element={<AdminVerifyBusiness />} />
      <Route path="/business-verification-success" element={<BusinessVerificationSuccess />} />
      <Route path="/customer-verification" element={<CustomerVerification />} />
      <Route path="/subscription" element={<Subscription />} />
      <Route path="/buy-credits" element={<BuyCredits />} />
      <Route path="/report-review/:reviewId" element={<ReportReview />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/about" element={<About />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/customer-benefits" element={<CustomerBenefits />} />
      <Route path="/customer-stories" element={<CustomerStories />} />
      <Route path="/success-stories" element={<SuccessStories />} />
      <Route path="/verification-resources" element={<VerificationResources />} />
      <Route path="/twilio-debug" element={<TwilioDebug />} />
      
      {/* App Store Assets Routes */}
      <Route path="/app-icon-preview" element={<AppIconPreviewPage />} />
      <Route path="/app-store-assets" element={<AppStoreAssetsPage />} />

      {/* Protected Routes */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/edit"
        element={
          <ProtectedRoute>
            <ProfileEdit />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/reviews"
        element={
          <ProtectedRoute>
            <ProfileReviews />
          </ProtectedRoute>
        }
      />
      <Route
        path="/review/new"
        element={
          <ProtectedRoute>
            <NewReview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/review/success"
        element={
          <ProtectedRoute>
            <ReviewSuccess />
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing"
        element={
          <ProtectedRoute>
            <BillingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />

      {/* Catch all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
