
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useLoading } from "@/contexts/LoadingContext";
import { useEffect } from "react";
import LoadingRoute from "./LoadingRoute";
import PrivateRoute from "./PrivateRoute";
import BusinessOrAdminRoute from "./BusinessOrAdminRoute";
import LoadingScreen from "@/components/LoadingScreen";
import WelpLoadingIcon from "@/components/ui/WelpLoadingIcon";

// Import pages
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import VerifyEmail from "@/pages/VerifyEmail";
import EmailVerificationSuccess from "@/pages/EmailVerificationSuccess";
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
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import Support from "@/pages/Support";
import AgeSuitability from "@/pages/AgeSuitability";
import VerifyLicense from "@/pages/VerifyLicense";
import NewReview from "@/pages/NewReview";
import DebugAccount from "@/pages/DebugAccount";
import CustomerProfile from "@/pages/CustomerProfile";
import BusinessProfile from "@/pages/BusinessProfile";
import Contact from "@/pages/Contact";
import BuyCredits from "@/pages/BuyCredits";

const AppRoutes = () => {
  const { loading } = useAuth();
  const { isPageLoading, setIsInitialLoading } = useLoading();

  // Handle initial loading completion
  useEffect(() => {
    if (!loading) {
      // Wait a bit for auth to fully settle, then hide initial loading
      const timer = setTimeout(() => {
        setIsInitialLoading(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [loading, setIsInitialLoading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#ea384c]">
        <WelpLoadingIcon size={120} />
      </div>
    );
  }

  return (
    <>
      <LoadingScreen />
      <LoadingRoute>
        <div className={isPageLoading ? 'invisible' : 'visible'}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/email-verification-success" element={<EmailVerificationSuccess />} />
            <Route path="/verification" element={<Verification />} />
            <Route path="/customer-benefits" element={<CustomerBenefits />} />
            <Route path="/customer-verification" element={<CustomerVerification />} />
            <Route path="/customer-stories" element={<CustomerStories />} />
            <Route path="/testimonials" element={<SuccessStories />} />
            <Route path="/success-stories" element={<SuccessStories />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/buy-credits" element={<BuyCredits />} />
            <Route path="/about" element={<About />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/support" element={<Support />} />
            <Route path="/age-suitability" element={<AgeSuitability />} />
            <Route path="/debug-account" element={<DebugAccount />} />
            
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
            
            {/* Profile routes */}
            <Route path="/customer-profile/:customerId" element={
              <PrivateRoute>
                <CustomerProfile />
              </PrivateRoute>
            } />
            
            <Route path="/business-profile/:businessId" element={
              <PrivateRoute>
                <BusinessProfile />
              </PrivateRoute>
            } />
            
            {/* Redirect any unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </LoadingRoute>
    </>
  );
};

export default AppRoutes;
