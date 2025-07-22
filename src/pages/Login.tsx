
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';
import { usePostAuthRedirect } from '@/hooks/usePostAuthRedirect';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Use the post-auth redirect hook
  usePostAuthRedirect();

  // Handle redirect with message from account creation
  useEffect(() => {
    const state = location.state as any;
    if (state?.message) {
      toast({
        title: "Account Created",
        description: state.message,
      });
      
      // Pre-fill email if provided
      if (state.email) {
        setEmail(state.email);
      }
      
      // Clear the state
      window.history.replaceState({}, document.title);
    }
  }, [location.state, toast]);

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      if (currentUser.type === 'business') {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/profile', { replace: true });
      }
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    console.log("🔐 Starting login process for:", email);

    try {
      const result = await login(email, password);
      console.log("📊 Login result:", result);

      if (result.success) {
        console.log("✅ Login successful");
        toast({
          title: "Welcome back!",
          description: "You have been successfully logged in.",
        });
        // Navigation will be handled by the useEffect hook above
      } else {
        console.log("❌ Login failed:", result.error);
        toast({
          title: "Login Failed",
          description: result.error || "Invalid email or password",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      toast({
        title: "Login Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
            <div className="text-sm text-center">
              Don't have an account?{" "}
              <Link 
                to="/signup" 
                className="text-blue-600 hover:underline"
              >
                Sign up here
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;
