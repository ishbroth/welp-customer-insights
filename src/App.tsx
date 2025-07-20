import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/auth/AuthProvider";
import { Toaster } from "@/components/ui/toaster";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Profile from "@/pages/Profile";
import EditProfile from "@/pages/EditProfile";
import BusinessPasswordSetup from "@/pages/BusinessPasswordSetup";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import VerifyPhone from "@/pages/VerifyPhone";
import Subscription from "@/pages/Subscription";
import NewReview from "@/pages/NewReview";
import CustomerSearch from "@/pages/CustomerSearch";
import ReviewPage from "@/pages/ReviewPage";
import BusinessReviews from "@/pages/BusinessReviews";
import React from "react";
import { useAuth } from "@/contexts/auth";
import { Navigate } from 'react-router-dom';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/edit-profile" element={<EditProfile />} />
              <Route path="/business-password-setup" element={<BusinessPasswordSetup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-phone" element={<VerifyPhone />} />
              <Route path="/subscription" element={<Subscription />} />
              <Route path="/review/new" element={<NewReview />} />
              <Route path="/customer-search" element={<CustomerSearch />} />
              <Route path="/review/:reviewId" element={<ReviewPage />} />
              <Route path="/business/:businessId/reviews" element={<BusinessReviews />} />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
