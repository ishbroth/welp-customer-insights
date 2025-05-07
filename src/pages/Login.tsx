
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Check, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle, loginWithApple, useMockData, setUseMockData } = useAuth();
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoggingInWithGoogle, setIsLoggingInWithGoogle] = useState(false);
  const [isLoggingInWithApple, setIsLoggingInWithApple] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter your email and password",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoggingIn(true);
    
    try {
      const success = await login(email, password);
      
      if (success) {
        toast({
          title: "Success",
          description: "Logged in successfully",
          variant: "default",
        });
        navigate("/");
      } else {
        toast({
          title: "Error",
          description: "Invalid email or password",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoggingInWithGoogle(true);
    
    try {
      const success = await loginWithGoogle();
      
      if (success) {
        toast({
          title: "Success",
          description: "Logged in with Google successfully",
          variant: "default",
        });
        navigate("/");
      } else {
        toast({
          title: "Login Failed",
          description: "Google login failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Google login error:", error);
      toast({
        title: "Error",
        description: "An error occurred during Google login",
        variant: "destructive",
      });
    } finally {
      setIsLoggingInWithGoogle(false);
    }
  };

  const handleAppleLogin = async () => {
    setIsLoggingInWithApple(true);
    
    try {
      const success = await loginWithApple();
      
      if (success) {
        toast({
          title: "Success",
          description: "Logged in with Apple successfully",
          variant: "default",
        });
        navigate("/");
      } else {
        toast({
          title: "Login Failed",
          description: "Apple login failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Apple login error:", error);
      toast({
        title: "Error",
        description: "An error occurred during Apple login",
        variant: "destructive",
      });
    } finally {
      setIsLoggingInWithApple(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <Card className="max-w-md mx-auto p-6">
            <h1 className="text-2xl font-bold text-center mb-6">Log In to Welp!</h1>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="welp-input"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="welp-input pr-10"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="welp-button w-full" 
                disabled={isLoggingIn}
              >
                {isLoggingIn ? "Logging in..." : "Log In"}
              </Button>
            </form>
            
            <div className="relative flex items-center justify-center mt-6 mb-4">
              <div className="border-t border-gray-300 absolute w-full"></div>
              <div className="bg-white px-4 relative z-10 text-sm text-gray-500">OR</div>
            </div>
            
            <Button
              type="button"
              variant="outline"
              className="w-full mb-3 relative bg-white hover:bg-gray-50"
              onClick={handleGoogleLogin}
              disabled={isLoggingInWithGoogle}
            >
              {isLoggingInWithGoogle ? (
                "Connecting..."
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </>
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              className="w-full relative bg-white hover:bg-gray-50"
              onClick={handleAppleLogin}
              disabled={isLoggingInWithApple}
            >
              {isLoggingInWithApple ? (
                "Connecting..."
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M17.112 24H6.888C3.088 24 0 20.912 0 17.112V6.888C0 3.088 3.088 0 6.888 0h10.224C20.912 0 24 3.088 24 6.888v10.224c0 3.8-3.088 6.888-6.888 6.888z"
                    />
                    <path
                      fill="white"
                      d="M16.982 11.596c-.022-2.13 1.731-3.152 1.809-3.202-0.985-1.44-2.518-1.637-3.062-1.659-1.304-0.131-2.547 0.764-3.205 0.764s-1.821-0.746-2.992-0.726c-1.54 0.023-2.961 0.892-3.758 2.268-1.598 2.773-0.41 6.877 1.147 9.126 0.762 1.101 1.669 2.339 2.861 2.296 1.146-0.044 1.58-0.742 2.968-0.742s1.776 0.742 2.993 0.72c1.234-0.021 2.015-1.126 2.774-2.223 0.873-1.278 1.232-2.515 1.254-2.578-0.028-0.011-2.403-0.921-2.424-3.652-0.021-2.289 1.871-3.387 1.959-3.446-1.074-1.582-2.738-1.751-3.324-1.796zM14.594 6.587c0.627-0.76 1.052-1.818 0.936-2.872-0.904 0.037-2 0.6-2.649 1.36-0.581 0.674-1.091 1.752-0.955 2.785 1.01 0.077 2.039-0.513 2.668-1.273z"
                    />
                  </svg>
                  Continue with Apple
                </>
              )}
            </Button>
            
            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                Don't have an account? <Link to="/signup" className="text-welp-primary hover:underline">Sign Up</Link>
              </p>
              <p className="text-xs text-gray-500 mt-2">
                <Link to="/forgot-password" className="hover:underline">Forgot Password?</Link>
              </p>
            </div>

            {/* Toggle for Mock/Real Data */}
            <div className="mt-8 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={!useMockData}
                    onChange={() => setUseMockData(!useMockData)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    {useMockData ? "Use Mock Data (Demo)" : "Use Real Database"}
                  </span>
                </label>
              </div>
              {useMockData && (
                <div className="mt-3 p-3 bg-blue-50 text-blue-700 rounded-md text-xs">
                  <h4 className="font-bold mb-1">Demo Login Credentials:</h4>
                  <p><Check className="inline-block w-4 h-4 mr-1" /> <strong>Business:</strong> business@example.com (any password)</p>
                  <p><Check className="inline-block w-4 h-4 mr-1" /> <strong>Customer:</strong> customer@example.com (any password)</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
