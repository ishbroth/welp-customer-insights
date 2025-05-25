
import { Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import SearchResults from "@/pages/SearchResults";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import VerifyPhone from "@/pages/VerifyPhone";
import NewReview from "@/pages/NewReview";
import ReviewSuccess from "@/pages/ReviewSuccess";
import Subscription from "@/pages/Subscription";
import OneTimeReviewAccess from "@/pages/OneTimeReviewAccess";
import About from "@/pages/About";
import HowItWorks from "@/pages/HowItWorks";
import FAQ from "@/pages/FAQ";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import NotFound from "@/pages/NotFound";
import ProfilePage from "@/pages/ProfilePage";
import ProfileEdit from "@/pages/ProfileEdit";
import ProfileReviews from "@/pages/ProfileReviews";
import BusinessReviews from "@/pages/BusinessReviews";
import NotificationsPage from "@/pages/NotificationsPage";
import BillingPage from "@/pages/BillingPage";
import BusinessVerificationSuccess from "@/pages/BusinessVerificationSuccess";
import SuccessStories from "@/pages/SuccessStories";
import Verification from "@/pages/Verification";
import CustomerVerification from "@/pages/CustomerVerification";
import CustomerBenefits from "@/pages/CustomerBenefits";
import CustomerStories from "@/pages/CustomerStories";
import ForgotPassword from "@/pages/ForgotPassword";
import AdminLogin from "@/pages/AdminLogin";
import CustomerProfile from "@/pages/CustomerProfile";
import BusinessProfile from "@/pages/BusinessProfile";
import ProtectedRoute from "./ProtectedRoute";
import BusinessOwnerRoute from "./BusinessOwnerRoute";
import BusinessOrAdminRoute from "./BusinessOrAdminRoute";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-phone" element={<VerifyPhone />} />
      <Route path="/verification" element={<Verification />} />
      <Route path="/review/success" element={<ReviewSuccess />} />
      <Route path="/subscription" element={<Subscription />} />
      <Route path="/one-time-review" element={<OneTimeReviewAccess />} />
      <Route path="/about" element={<About />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/success-stories" element={<SuccessStories />} />
      <Route path="/business-verification-success" element={<BusinessVerificationSuccess />} />
      <Route path="/admin" element={<AdminLogin />} />
      
      {/* Customer pages */}
      <Route path="/customer-verification" element={<CustomerVerification />} />
      <Route path="/customer-benefits" element={<CustomerBenefits />} />
      <Route path="/customer-stories" element={<CustomerStories />} />
      
      {/* Search page is now accessible to all users */}
      <Route path="/search" element={<SearchResults />} />
      
      {/* Customer profile viewing for business owners */}
      <Route path="/customer/:customerId" element={
        <BusinessOrAdminRoute>
          <CustomerProfile />
        </BusinessOrAdminRoute>
      } />
      
      {/* Business profile viewing for customer users with subscription or one-time access */}
      <Route path="/business/:businessId" element={
        <ProtectedRoute>
          <BusinessProfile />
        </ProtectedRoute>
      } />
      
      {/* Business owner specific routes */}
      <Route path="/review/new" element={
        <BusinessOwnerRoute>
          <NewReview />
        </BusinessOwnerRoute>
      } />
      
      <Route path="/profile/business-reviews" element={
        <BusinessOwnerRoute>
          <BusinessReviews />
        </BusinessOwnerRoute>
      } />
      
      {/* Protected routes */}
      <Route path="/profile" element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } />
      <Route path="/profile/edit" element={
        <ProtectedRoute>
          <ProfileEdit />
        </ProtectedRoute>
      } />
      <Route path="/profile/reviews" element={
        <ProtectedRoute>
          <ProfileReviews />
        </ProtectedRoute>
      } />
      <Route path="/profile/notifications" element={
        <ProtectedRoute>
          <NotificationsPage />
        </ProtectedRoute>
      } />
      <Route path="/profile/billing" element={
        <ProtectedRoute>
          <BillingPage />
        </ProtectedRoute>
      } />
      
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
