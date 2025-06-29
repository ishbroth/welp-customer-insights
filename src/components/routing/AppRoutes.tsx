
import { Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Registration from "@/pages/Registration";
import Verification from "@/pages/Verification";
import Profile from "@/pages/Profile";
import ProfileReviews from "@/pages/ProfileReviews";
import CustomerProfile from "@/pages/CustomerProfile";
import BusinessProfile from "@/pages/BusinessProfile";
import SearchResults from "@/pages/SearchResults";
import NewReview from "@/pages/NewReview";
import OneTimeReview from "@/pages/OneTimeReview";
import Subscribe from "@/pages/Subscribe";
import BusinessVerification from "@/pages/BusinessVerification";
import VerificationRequest from "@/pages/VerificationRequest";
import ProtectedRoute from "./ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Registration />} />
      <Route path="/verification" element={<Verification />} />
      <Route path="/search" element={<SearchResults />} />
      
      {/* Protected Routes */}
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      
      <Route path="/profile-reviews" element={
        <ProtectedRoute>
          <ProfileReviews />
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
      
      <Route path="/new-review" element={
        <ProtectedRoute>
          <NewReview />
        </ProtectedRoute>
      } />
      
      <Route path="/one-time-review" element={
        <ProtectedRoute>
          <OneTimeReview />
        </ProtectedRoute>
      } />
      
      <Route path="/subscribe" element={
        <ProtectedRoute>
          <Subscribe />
        </ProtectedRoute>
      } />
      
      <Route path="/business-verification" element={
        <ProtectedRoute>
          <BusinessVerification />
        </ProtectedRoute>
      } />
      
      <Route path="/verification-request" element={
        <ProtectedRoute>
          <VerificationRequest />
        </ProtectedRoute>
      } />
    </Routes>
  );
};

export default AppRoutes;
