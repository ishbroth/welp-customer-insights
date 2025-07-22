import { QueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "@/pages/Home";
import BusinessSearch from "@/pages/BusinessSearch";
import BusinessProfile from "@/pages/BusinessProfile";
import Profile from "@/pages/Profile";
import EditProfile from "@/pages/EditProfile";
import Signup from "@/pages/Signup";
import Signin from "@/pages/Signin";
import CustomerSupport from "@/pages/CustomerSupport";
import TermsOfService from "@/pages/TermsOfService";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import NotFound from "@/pages/NotFound";
import { useAuth } from "@/contexts/auth";
import { useEffect } from "react";
import VerifyPhone from "@/pages/VerifyPhone";
import VerifyEmail from "@/pages/VerifyEmail";

function App() {
  return (
    <QueryClient>
      <Toaster />
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<BusinessSearch />} />
          <Route path="/business/:id" element={<BusinessProfile />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/customer-support" element={<CustomerSupport />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/verify-phone" element={<VerifyPhone />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
        </Routes>
      </Router>
    </QueryClient>
  );
}

export default App;
