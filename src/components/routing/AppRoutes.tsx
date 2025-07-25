
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useLoading } from "@/contexts/LoadingContext";
import LoadingRoute from "./LoadingRoute";
import PrivateRoute from "./PrivateRoute";
import BusinessOrAdminRoute from "./BusinessOrAdminRoute";

// Import pages
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import VerifyEmail from "@/pages/VerifyEmail";
import BillingPage from "@/pages/BillingPage";
import ProfilePage from "@/pages/ProfilePage";
import ProfileEdit from "@/pages/ProfileEdit";
import ProfileReviews from "@/pages/ProfileReviews";
import CustomerBenefits from "@/pages/CustomerBenefits";
import NotificationsPage from "@/pages/NotificationsPage";
import SearchResults from "@/pages/SearchResults";
import Subscription from "@/pages/Subscription";
import CustomerVerification from "@/pages/CustomerVerification";
import CustomerStories from "@/pages/CustomerStories";
import SuccessStories from "@/pages/SuccessStories";
import Verification from "@/pages/Verification";
import About from "@/pages/About";
import HowItWorks from "@/pages/HowItWorks";
import FAQ from "@/pages/FAQ";
import VerifyLicense from "@/pages/VerifyLicense";
import NewReview from "@/pages/NewReview";

const AppRoutes = () => {
  const { loading } = useAuth();
  const { isPageLoading } = useLoading();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <LoadingRoute>
      <div className={isPageLoading ? 'invisible' : 'visible'}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/verification" element={<Verification />} />
          <Route path="/customer-benefits" element={<CustomerBenefits />} />
          <Route path="/customer-verification" element={<CustomerVerification />} />
          <Route path="/customer-stories" element={<CustomerStories />} />
          <Route path="/testimonials" element={<SuccessStories />} />
          <Route path="/success-stories" element={<SuccessStories />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/about" element={<About />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/faq" element={<FAQ />} />
          
          <Route path="/review/new" element={
            <PrivateRoute>
              <NewReview />
            </PrivateRoute>
          } />
          
          <Route path="/profile" element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          } />
          
          <Route path="/profile/edit" element={
            <PrivateRoute>
              <ProfileEdit />
            </PrivateRoute>
          } />
          
          <Route path="/profile/reviews" element={
            <PrivateRoute>
              <ProfileReviews />
            </PrivateRoute>
          } />
          
          <Route path="/profile/business-reviews" element={
            <PrivateRoute>
              <ProfileReviews />
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
          
          <Route path="/verify-license" element={
            <PrivateRoute>
              <VerifyLicense />
            </PrivateRoute>
          } />
          
          {/* Redirect any unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </LoadingRoute>
  );
};

export default AppRoutes;
