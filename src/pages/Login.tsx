
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login, session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get success message if passed from another page
  const [successMessage, setSuccessMessage] = useState<string | null>(
    location.state?.message || null
  );

  // Navigate to profile when session is established (regardless of profile loading status)
  useEffect(() => {
    if (session?.user) {
      console.log("Session established, navigating to profile");
      navigate("/profile");
    }
  }, [session, navigate]);

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
      const { success, error } = await login(email, password);
      
      if (success) {
        toast({
          title: "Logged In",
          description: "Welcome back to Welp.",
        });
        // Navigation will happen automatically via the useEffect above when session is set
      } else {
        toast({
          title: "Login Failed",
          description: error || "Invalid email or password. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
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
