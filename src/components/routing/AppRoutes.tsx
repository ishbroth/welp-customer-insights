
import { Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Verification from "@/pages/Verification";
import ProfilePage from "@/pages/ProfilePage";
import ProfileReviews from "@/pages/ProfileReviews";
import CustomerProfile from "@/pages/CustomerProfile";
import BusinessProfile from "@/pages/BusinessProfile";
import SearchResults from "@/pages/SearchResults";
import NewReview from "@/pages/NewReview";
import ReviewSuccess from "@/pages/ReviewSuccess";
import BusinessReviews from "@/pages/BusinessReviews";
import OneTimeReviewAccess from "@/pages/OneTimeReviewAccess";
import Subscription from "@/pages/Subscription";
import BusinessVerificationSuccess from "@/pages/BusinessVerificationSuccess";
import VerificationResources from "@/pages/VerificationResources";
import ProtectedRoute from "./ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verification" element={<Verification />} />
      <Route path="/search" element={<SearchResults />} />
      
      {/* Protected Routes */}
      <Route path="/profile" element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } />
      
      <Route path="/profile-reviews" element={
        <ProtectedRoute>
          <ProfileReviews />
        </ProtectedRoute>
      } />
      
      <Route path="/profile/reviews" element={
        <ProtectedRoute>
          <ProfileReviews />
        </ProtectedRoute>
      } />
      
      <Route path="/profile/business-reviews" element={
        <ProtectedRoute>
          <BusinessReviews />
        </ProtectedRoute>
      } />
      
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
      
      <Route path="/review/new" element={
        <ProtectedRoute>
          <NewReview />
        </ProtectedRoute>
      } />
      
      <Route path="/review/success" element={
        <ProtectedRoute>
          <ReviewSuccess />
        </ProtectedRoute>
      } />
      
      <Route path="/one-time-review-access" element={
        <ProtectedRoute>
          <OneTimeReviewAccess />
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
