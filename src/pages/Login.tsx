
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, currentUser, session, loading } = useAuth();
  const navigate = useNavigate();

  // Handle navigation when auth state changes
  useEffect(() => {
    console.log("🔍 Auth state:", { 
      loading, 
      hasSession: !!session, 
      hasCurrentUser: !!currentUser,
      userId: currentUser?.id 
    });

    // Only navigate if we're not loading and have both session and user
    if (!loading && session && currentUser) {
      console.log("✅ Auth complete, navigating to profile");
      navigate("/profile");
    }
  }, [loading, session, currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    console.log("🔐 Starting login process");

    try {
      const result = await login(email, password);

      if (result.success) {
        console.log("🔐 Login call successful");
        // Don't navigate here - let the useEffect handle it based on auth state
        toast.success("Login successful!");
      } else {
        console.error("❌ Login failed:", result.error);
        toast.error(result.error || "Login failed");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      toast.error("An unexpected error occurred");
      setIsSubmitting(false);
    }
  };

  // Show loading spinner if auth is loading or we're submitting
  if (loading || isSubmitting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-gray-600">
            {isSubmitting ? "Signing you in..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>
            Welcome back! Please sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                autoComplete="email"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
          <div className="mt-4 text-center space-y-2">
            <Link to="/forgot-password" className="text-sm text-primary hover:underline block">
              Forgot your password?
            </Link>
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary hover:underline">
                Create one
              </Link>
            </p>
            <Link 
              to="/" 
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mt-3"
            >
              <ArrowLeft className="h-3 w-3" />
              Back to Welp.
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
