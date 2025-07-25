
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/auth";
import { SecurityProvider } from "./components/SecurityProvider";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import BusinessSignup from "./pages/BusinessSignup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Verification from "./pages/Verification";
import PhoneVerification from "./pages/PhoneVerification";
import BusinessInfo from "./pages/BusinessInfo";
import BusinessProfile from "./pages/BusinessProfile";
import BusinessSignupFlow from "./pages/BusinessSignupFlow";
import BusinessDashboard from "./pages/BusinessDashboard";
import BusinessReviews from "./pages/BusinessReviews";
import BusinessSettings from "./pages/BusinessSettings";
import BusinessAnalytics from "./pages/BusinessAnalytics";
import BusinessLicenseVerification from "./pages/BusinessLicenseVerification";
import CustomerSignup from "./pages/CustomerSignup";
import CustomerDashboard from "./pages/CustomerDashboard";
import CustomerReviews from "./pages/CustomerReviews";
import CustomerSettings from "./pages/CustomerSettings";
import CustomerProfile from "./pages/CustomerProfile";
import ReviewDetails from "./pages/ReviewDetails";
import FindBusiness from "./pages/FindBusiness";
import ClaimReview from "./pages/ClaimReview";
import Settings from "./pages/Settings";
import BusinessList from "./pages/BusinessList";
import ThreeStepBusinessSignup from "./pages/ThreeStepBusinessSignup";
import CustomerSignupFlow from "./pages/CustomerSignupFlow";
import CustomerPhoneVerification from "./pages/CustomerPhoneVerification";
import ReviewClaim from "./pages/ReviewClaim";
import CompleteBusinessSignup from "./pages/CompleteBusinessSignup";
import CustomerVerification from "./pages/CustomerVerification";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import Pricing from "./pages/Pricing";
import Features from "./pages/Features";
import Help from "./pages/Help";
import FAQ from "./pages/FAQ";
import NotFound from "./pages/NotFound";
import BusinessVerification from "./pages/BusinessVerification";
import BusinessPayment from "./pages/BusinessPayment";
import BusinessSuccess from "./pages/BusinessSuccess";
import SecurityTest from "./pages/SecurityTest";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SecurityProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/business-signup" element={<BusinessSignup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/verification" element={<Verification />} />
                <Route path="/phone-verification" element={<PhoneVerification />} />
                <Route path="/business-info" element={<BusinessInfo />} />
                <Route path="/business-profile" element={<BusinessProfile />} />
                <Route path="/business-signup-flow" element={<BusinessSignupFlow />} />
                <Route path="/business-dashboard" element={<BusinessDashboard />} />
                <Route path="/business-reviews" element={<BusinessReviews />} />
                <Route path="/business-settings" element={<BusinessSettings />} />
                <Route path="/business-analytics" element={<BusinessAnalytics />} />
                <Route path="/business-license-verification" element={<BusinessLicenseVerification />} />
                <Route path="/customer-signup" element={<CustomerSignup />} />
                <Route path="/customer-dashboard" element={<CustomerDashboard />} />
                <Route path="/customer-reviews" element={<CustomerReviews />} />
                <Route path="/customer-settings" element={<CustomerSettings />} />
                <Route path="/customer-profile" element={<CustomerProfile />} />
                <Route path="/review/:id" element={<ReviewDetails />} />
                <Route path="/find-business" element={<FindBusiness />} />
                <Route path="/claim-review" element={<ClaimReview />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/business-list" element={<BusinessList />} />
                <Route path="/three-step-business-signup" element={<ThreeStepBusinessSignup />} />
                <Route path="/customer-signup-flow" element={<CustomerSignupFlow />} />
                <Route path="/customer-phone-verification" element={<CustomerPhoneVerification />} />
                <Route path="/review-claim" element={<ReviewClaim />} />
                <Route path="/complete-business-signup" element={<CompleteBusinessSignup />} />
                <Route path="/customer-verification" element={<CustomerVerification />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/features" element={<Features />} />
                <Route path="/help" element={<Help />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/business-verification" element={<BusinessVerification />} />
                <Route path="/business-payment" element={<BusinessPayment />} />
                <Route path="/business-success" element={<BusinessSuccess />} />
                <Route path="/security-test" element={<SecurityTest />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </SecurityProvider>
    </QueryClientProvider>
  );
}

export default App;
