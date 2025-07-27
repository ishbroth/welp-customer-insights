
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/auth";
import { Toaster } from "@/components/ui/sonner";
import { Toaster as HotToaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Profile from "@/pages/Profile";
import Business from "@/pages/Business";
import Review from "@/pages/Review";
import VerifyPhone from "@/pages/VerifyPhone";
import VerifyEmail from "@/pages/VerifyEmail";
import ForgotPassword from "@/pages/ForgotPassword";
import Reviews from "@/pages/Reviews";
import CreateReview from "@/pages/CreateReview";
import Verification from "@/pages/Verification";
import DebugAccount from "@/pages/DebugAccount";

const queryClient = new QueryClient();

const QueryClientWrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

function App() {
  return (
    <QueryClientWrapper>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/business/:id" element={<Business />} />
            <Route path="/review/:id" element={<Review />} />
            <Route path="/verify-phone" element={<VerifyPhone />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/create-review" element={<CreateReview />} />
            <Route path="/verification" element={<Verification />} />
            <Route path="/debug-account" element={<DebugAccount />} />
          </Routes>
          <Toaster />
          <HotToaster />
        </AuthProvider>
      </Router>
    </QueryClientWrapper>
  );
}

export default App;
