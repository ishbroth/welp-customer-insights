

import { Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Verification from "@/pages/Verification";
import ProfilePage from "@/pages/ProfilePage";
import ProfileEdit from "@/pages/ProfileEdit";
import ProfileReviews from "@/pages/ProfileReviews";
import CustomerProfile from "@/pages/CustomerProfile";
import BusinessProfile from "@/pages/BusinessProfile";
import SearchResults from "@/pages/SearchResults";
import NewReview from "@/pages/NewReview";
import ReviewSuccess from "@/pages/ReviewSuccess";
import BusinessReviews from "@/pages/BusinessReviews";
import Subscription from "@/pages/Subscription";
import BillingPage from "@/pages/BillingPage";
import NotificationsPage from "@/pages/NotificationsPage";
import BusinessVerificationSuccess from "@/pages/BusinessVerificationSuccess";
import VerificationResources from "@/pages/VerificationResources";
import About from "@/pages/About";
import HowItWorks from "@/pages/HowItWorks";
import FAQ from "@/pages/FAQ";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import SuccessStories from "@/pages/SuccessStories";
import CustomerBenefits from "@/pages/CustomerBenefits";
import CustomerStories from "@/pages/CustomerStories";
import CustomerVerification from "@/pages/CustomerVerification";
import ProtectedRoute from "./ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verification" element={<Verification />} />
      <Route path="/search" element={<SearchResults />} />
      
      {/* Public pages */}
      <Route path="/about" element={<About />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/success-stories" element={<SuccessStories />} />
      <Route path="/customer-benefits" element={<CustomerBenefits />} />
      <Route path="/customer-stories" element={<CustomerStories />} />
      <Route path="/customer-verification" element={<CustomerVerification />} />
      
      {/* Protected Profile Routes */}
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
      
      {/* Customer Reviews - works for both business and customer users */}
      <Route path="/profile/reviews" element={
        <ProtectedRoute>
          <ProfileReviews />
        </ProtectedRoute>
      } />
      
      {/* Business Reviews - for business users writing reviews about customers */}
      <Route path="/profile/business-reviews" element={
        <ProtectedRoute>
          <BusinessReviews />
        </ProtectedRoute>
      } />
      
      {/* Billing page with transaction history, payment methods, credits */}
      <Route path="/profile/billing" element={
        <ProtectedRoute>
          <BillingPage />
        </ProtectedRoute>
      } />
      
      {/* Notifications page */}
      <Route path="/notifications" element={
        <ProtectedRoute>
          <NotificationsPage />
        </ProtectedRoute>
      } />
      
      {/* Legacy route redirects */}
      <Route path="/profile-reviews" element={
        <ProtectedRoute>
          <ProfileReviews />
        </ProtectedRoute>
      } />
      
      {/* Profile viewing routes */}
      <Route path="/customer-profile/:customerId" element={
        <ProtectedRoute>
          <CustomerProfile />
        </ProtectedRoute>
      } />
      
      <Route path="/business-profile/:businessId" element={
        <ProtectedRoute>
          <BusinessProfile />
        </ProtectedRoute>
      } />
      
      {/* Alternative business profile route */}
      <Route path="/business/:businessId" element={
        <ProtectedRoute>
          <BusinessProfile />
        </ProtectedRoute>
      } />
      
      {/* Review routes - both /review/new and /new-review for compatibility */}
      <Route path="/review/new" element={
        <ProtectedRoute>
          <NewReview />
        </ProtectedRoute>
      } />
      
      <Route path="/new-review" element={
        <ProtectedRoute>
          <NewReview />
        </ProtectedRoute>
      } />
      
      <Route path="/review/success" element={
        <ProtectedRoute>
          <ReviewSuccess />
        </ProtectedRoute>
      } />
      
      <Route path="/subscription" element={
        <ProtectedRoute>
          <Subscription />
        </ProtectedRoute>
      } />
      
      <Route path="/business-verification-success" element={
        <ProtectedRoute>
          <BusinessVerificationSuccess />
        </ProtectedRoute>
      } />
      
      <Route path="/verification-resources" element={
        <ProtectedRoute>
          <VerificationResources />
        </ProtectedRoute>
      } />
    </Routes>
  );
};

export default AppRoutes;
