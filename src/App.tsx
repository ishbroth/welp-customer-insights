import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/auth";
import BusinessProfilePage from "./pages/BusinessProfilePage";
import CustomerProfilePage from "./pages/CustomerProfilePage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import MobileTestPage from "./components/mobile/MobileTestPage";
import NewReviewPage from "./pages/NewReviewPage";
import NotFoundPage from "./pages/NotFoundPage";
import PasswordResetPage from "./pages/PasswordResetPage";
import ProfilePage from "./pages/ProfilePage";
import ReviewSuccessPage from "./pages/ReviewSuccessPage";
import SearchPage from "./pages/SearchPage";
import SignUpPage from "./pages/SignUpPage";
import BusinessReviewsPage from "./pages/BusinessReviewsPage";
import { QueryClient } from "@tanstack/react-query";
import AppIconPreviewPage from "@/pages/AppIconPreview";
import AppStoreAssetsPage from "@/pages/AppStoreAssets";

function App() {
  return (
    <QueryClient>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/password-reset" element={<PasswordResetPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/business" element={<BusinessProfilePage />} />
            <Route path="/profile/customer" element={<CustomerProfilePage />} />
            <Route path="/profile/business-reviews" element={<BusinessReviewsPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/review/new" element={<NewReviewPage />} />
            <Route path="/review/success" element={<ReviewSuccessPage />} />
            <Route path="/mobile-test" element={<MobileTestPage />} />
            
            {/* App Store Development Routes */}
            <Route path="/app-icon-preview" element={<AppIconPreviewPage />} />
            <Route path="/app-store-assets" element={<AppStoreAssetsPage />} />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClient>
  );
}

export default App;
