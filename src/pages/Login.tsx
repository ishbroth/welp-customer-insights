import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AlertCircle } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login, loginWithGoogle, loginWithApple } = useAuth();
  const navigate = useNavigate();
  
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
      const success = await login(email, password);
      
      if (success) {
        toast({
          title: "Logged In",
          description: "Welcome back to Welp.",
        });
        navigate("/profile");
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid email. Please use one of the test accounts.",
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

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const success = await loginWithGoogle();
      if (success) {
        toast({
          title: "Logged In",
          description: "Welcome back to Welp.",
        });
        navigate("/profile");
      }
    } catch (error) {
      toast({
        title: "Google Login Failed",
        description: "Could not log in with Google. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setIsLoading(true);
    try {
      const success = await loginWithApple();
      if (success) {
        toast({
          title: "Logged In",
          description: "Welcome back to Welp.",
        });
        navigate("/profile");
      }
    } catch (error) {
      toast({
        title: "Apple Login Failed",
        description: "Could not log in with Apple. Please try again.",
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
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
              <div className="flex items-start">
                <AlertCircle className="text-yellow-600 mr-2 mt-0.5" size={16} />
                <div>
                  <h3 className="font-semibold text-yellow-800">Available Test Accounts</h3>
                  <p className="text-sm text-yellow-700">
                    <strong>Business owner:</strong> business@example.com<br />
                    <strong>Customer:</strong> customer@example.com
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">Any password will work</p>
                </div>
              </div>
            </div>
            
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
            
            <div className="mt-8 pt-6 border-t">
              <p className="text-sm text-center text-gray-500 mb-4">
                Log in with
              </p>
              <div className="flex justify-center space-x-4">
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-center"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                >
                  Google
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-center"
                  onClick={handleAppleLogin}
                  disabled={isLoading}
                >
                  Apple
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
