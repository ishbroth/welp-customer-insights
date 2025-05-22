
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/auth";
import { useState } from "react";
import Index from "./pages/Index";
import SearchResults from "./pages/SearchResults";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyPhone from "./pages/VerifyPhone";
import NewReview from "./pages/NewReview";
import ReviewSuccess from "./pages/ReviewSuccess";
import Subscription from "./pages/Subscription";
import OneTimeReviewAccess from "./pages/OneTimeReviewAccess";
import About from "./pages/About";
import HowItWorks from "./pages/HowItWorks";
import FAQ from "./pages/FAQ";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import ProfilePage from "./pages/ProfilePage";
import ProfileEdit from "./pages/ProfileEdit";
import ProfileReviews from "./pages/ProfileReviews";
import BusinessReviews from "./pages/BusinessReviews";
import NotificationsPage from "./pages/NotificationsPage";
import BillingPage from "./pages/BillingPage";
import BusinessVerificationSuccess from "./pages/BusinessVerificationSuccess";
import SuccessStories from "./pages/SuccessStories";
import Verification from "./pages/Verification";
import CustomerVerification from "./pages/CustomerVerification";
import CustomerBenefits from "./pages/CustomerBenefits";
import CustomerStories from "./pages/CustomerStories";
import ForgotPassword from "./pages/ForgotPassword";
import AdminLogin from "./pages/AdminLogin";

// Protected route component that allows access if user is logged in
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useAuth();
  
  // Allow access if user is logged in
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Business owner route component that allows access only for business owners
const BusinessOwnerRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useAuth();
  
  // Redirect to login if not logged in
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirect if not a business owner
  if (currentUser.type === "customer") {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// Business owner or admin route component
const BusinessOrAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useAuth();
  
  // Redirect to login if not logged in
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirect if not a business owner or admin
  if (currentUser.type === "customer") {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// Routes component that uses the AuthContext
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

// App component with proper provider nesting
const App = () => {
  // Create a new QueryClient instance inside the component
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
