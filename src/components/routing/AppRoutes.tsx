
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useLoading } from "@/contexts/LoadingContext";
import { useEffect, lazy, Suspense } from "react";
import LoadingRoute from "./LoadingRoute";
import PrivateRoute from "./PrivateRoute";
import BusinessOrAdminRoute from "./BusinessOrAdminRoute";
import LoadingScreen from "@/components/LoadingScreen";
import WelpLoadingIcon from "@/components/ui/WelpLoadingIcon";

// Static imports for frequently accessed pages (faster initial load)
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import VerifyEmail from "@/pages/VerifyEmail";
import EmailVerificationSuccess from "@/pages/EmailVerificationSuccess";
import SearchResults from "@/pages/SearchResults";
import ProfilePage from "@/pages/ProfilePage";

// Lazy load less frequently used pages to reduce bundle size
const BillingPage = lazy(() => import("@/pages/BillingPage"));
const ProfileEdit = lazy(() => import("@/pages/ProfileEdit"));
const ProfileReviews = lazy(() => import("@/pages/ProfileReviews"));
const RequestReviews = lazy(() => import("@/pages/RequestReviews"));
const CustomerBenefits = lazy(() => import("@/pages/CustomerBenefits"));
const NotificationsPage = lazy(() => import("@/pages/NotificationsPage"));
const Subscription = lazy(() => import("@/pages/Subscription"));
const CustomerVerification = lazy(() => import("@/pages/CustomerVerification"));
const CustomerStories = lazy(() => import("@/pages/CustomerStories"));
const SuccessStories = lazy(() => import("@/pages/SuccessStories"));
const Verification = lazy(() => import("@/pages/Verification"));
const About = lazy(() => import("@/pages/About"));
const HowItWorks = lazy(() => import("@/pages/HowItWorks"));
const FAQ = lazy(() => import("@/pages/FAQ"));
const Terms = lazy(() => import("@/pages/Terms"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const Support = lazy(() => import("@/pages/Support"));
const AgeSuitability = lazy(() => import("@/pages/AgeSuitability"));
const VerifyLicense = lazy(() => import("@/pages/VerifyLicense"));
const NewReview = lazy(() => import("@/pages/NewReview"));
const ReviewFromRequest = lazy(() => import("@/pages/ReviewFromRequest"));
const DebugAccount = lazy(() => import("@/pages/DebugAccount"));
const CustomerProfile = lazy(() => import("@/pages/CustomerProfile"));
const BusinessProfile = lazy(() => import("@/pages/BusinessProfile"));
const Contact = lazy(() => import("@/pages/Contact"));
const BuyCredits = lazy(() => import("@/pages/BuyCredits"));

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
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
              <WelpLoadingIcon size={80} />
            </div>
          }>
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

              <Route path="/review/request" element={<ReviewFromRequest />} />

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

              <Route path="/profile/request-reviews" element={
                <PrivateRoute>
                  <RequestReviews />
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
          </Suspense>
        </div>
      </LoadingRoute>
    </>
  );
};

export default AppRoutes;
