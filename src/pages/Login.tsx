import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get success message and return URL if passed from another page
  const [successMessage, setSuccessMessage] = useState<string | null>(
    location.state?.message || null
  );
  const returnTo = location.state?.returnTo || "/profile";
  const prefilledEmail = location.state?.email || "";

  // Load remembered credentials on component mount and handle prefilled email
  useEffect(() => {
    // First priority: prefilled email from navigation state
    if (prefilledEmail) {
      setEmail(prefilledEmail);
    } else {
      // Second priority: remembered email from localStorage
      const rememberedEmail = localStorage.getItem("welp_remembered_email");
      if (rememberedEmail) {
        setEmail(rememberedEmail);
        setRememberMe(true);
      }
    }
  }, [prefilledEmail]);

  // Clear the success message after 10 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("🔐 Starting login process for:", email);
      const result = await login(email, password);
      console.log("📊 Login result:", result);
      
      if (result.success) {
        // Handle remember me functionality
        if (rememberMe) {
          localStorage.setItem("welp_remembered_email", email);
        } else {
          localStorage.removeItem("welp_remembered_email");
        }
        
        // Check if phone verification is needed
        if (result.needsPhoneVerification) {
          console.log("🔄 Phone verification required - redirecting to verification page");
          console.log("📱 Verification data:", {
            phone: result.phone,
            accountType: result.verificationData?.accountType
          });
          
          const params = new URLSearchParams({
            email: email,
            password: password,
            phone: result.phone || '',
            accountType: result.verificationData?.accountType || 'customer'
          });
          
          toast({
            title: "Phone Verification Required",
            description: "Please complete phone verification to access your account.",
          });
          
          console.log("🔄 Navigating to verify-phone with params:", params.toString());
          navigate(`/verify-phone?${params.toString()}`);
          return;
        }
        
        toast({
          title: "Logged In",
          description: "Welcome back to Welp.",
        });
        
        // Check for pending review access first (highest priority)
        const pendingReviewAccess = sessionStorage.getItem('pendingReviewAccess');
        if (pendingReviewAccess) {
          try {
            const { reviewId, accessType } = JSON.parse(pendingReviewAccess);
            sessionStorage.removeItem('pendingReviewAccess');
            
            if (accessType === 'one-time') {
              // Redirect to one-time payment
              const { data, error } = await supabase.functions.invoke("create-payment", {
                body: {
                  reviewId,
                  amount: 300,
                  isGuest: false
                }
              });
              
              if (error) {
                toast({
                  title: "Payment Error",
                  description: "Could not create payment session. Please try again.",
                  variant: "destructive"
                });
                navigate(`/subscription?reviewId=${reviewId}&type=one-time`);
                return;
              }
              
              if (data?.url) {
                window.location.href = data.url;
                return;
              }
            } else {
              // Redirect to subscription page
              navigate('/subscription');
              return;
            }
          } catch (error) {
            console.error("Error handling pending review access:", error);
          }
        }
        
        // Check if there's pending review data from the customer search
        const pendingReviewData = sessionStorage.getItem('pendingReviewData');
        if (pendingReviewData) {
          try {
            const customerData = JSON.parse(pendingReviewData);
            sessionStorage.removeItem('pendingReviewData');
            
            // Redirect to review form with customer data pre-filled
            const params = new URLSearchParams(customerData);
            navigate(`/review/new?${params.toString()}`);
            return;
          } catch (error) {
            console.error("Error parsing pending review data:", error);
            // Fallback to default redirect
          }
        }
        
        // Default redirect to the returnTo URL or profile
        navigate(returnTo);
      } else {
        // Check if user needs password setup
        if (result.needsPasswordSetup) {
          toast({
            title: "Complete Registration",
            description: "Please complete your account setup.",
          });
          
          // Redirect to password setup with user info
          navigate('/business-password-setup', {
            state: {
              businessEmail: email,
              phone: result.phone
            }
          });
          return;
        }
        
        toast({
          title: "Login Failed",
          description: result.error || "Invalid email or password. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("💥 Unexpected error in login:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-md mx-auto p-6">
            <h1 className="text-3xl font-bold text-center mb-6">Log In to Welp.</h1>
            
            {successMessage && (
              <Alert className="mb-6 bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="welp-input"
                    required
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="password" className="block text-sm font-medium">Password</label>
                    <Link to="/forgot-password" className="text-sm text-welp-primary hover:underline">
                      Forgot Password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="welp-input"
                    required
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <label htmlFor="remember-me" className="text-sm text-gray-600">
                    Remember me on this device
                  </label>
                </div>
                
                <Button
                  type="submit"
                  className="welp-button w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Log In"}
                </Button>
              </div>
            </form>
            
            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                Don't have an account? <Link to="/signup" className="text-welp-primary hover:underline">Sign Up</Link>
              </p>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
