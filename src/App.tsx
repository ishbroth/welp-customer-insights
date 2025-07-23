
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import CustomerReviews from "./pages/CustomerReviews";
import BusinessReviews from "./pages/BusinessReviews";
import BillingPage from "./pages/BillingPage";
import Subscription from "./pages/Subscription";
import CustomerBenefits from "./pages/CustomerBenefits";
import BusinessBenefits from "./pages/BusinessBenefits";
import Login from "./pages/Login";
import Register from "./pages/Register";
import WriteReview from "./pages/WriteReview";
import Notifications from "./pages/Notifications";
import ClaimReview from "./pages/ClaimReview";
import BusinessProfile from "./pages/BusinessProfile";
import CustomerProfile from "./pages/CustomerProfile";
import AllReviews from "./pages/AllReviews";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Support from "./pages/Support";
import AdminDashboard from "./pages/AdminDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/edit" element={<EditProfile />} />
            <Route path="/profile/reviews" element={<CustomerReviews />} />
            <Route path="/profile/business-reviews" element={<BusinessReviews />} />
            <Route path="/profile/billing" element={<BillingPage />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/customer-benefits" element={<CustomerBenefits />} />
            <Route path="/business-benefits" element={<BusinessBenefits />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/write-review" element={<WriteReview />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/claim-review/:reviewId" element={<ClaimReview />} />
            <Route path="/business/:businessId" element={<BusinessProfile />} />
            <Route path="/customer/:customerId" element={<CustomerProfile />} />
            <Route path="/reviews" element={<AllReviews />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/support" element={<Support />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
