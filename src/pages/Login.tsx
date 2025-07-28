
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [waitingForAuth, setWaitingForAuth] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!waitingForAuth) return;

    console.log("🔍 Setting up auth listener for login navigation");
    
    let navigationTimeout: NodeJS.Timeout;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("🔐 Auth state change during login:", event, "session user:", session?.user?.id);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log("✅ User signed in, navigating to profile");
          setWaitingForAuth(false);
          clearTimeout(navigationTimeout);
          navigate("/profile");
        }
      }
    );

    // Also check for existing session immediately
    const checkExistingSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        console.log("✅ Found existing session, navigating to profile");
        setWaitingForAuth(false);
        clearTimeout(navigationTimeout);
        navigate("/profile");
      }
    };

    // Check immediately and then after a short delay
    checkExistingSession();
    setTimeout(checkExistingSession, 100);

    // Timeout fallback to prevent getting stuck
    navigationTimeout = setTimeout(() => {
      console.log("⚠️ Navigation timeout, checking session one more time");
      checkExistingSession().then(() => {
        // If still no session after timeout, reset the state
        setWaitingForAuth(false);
        setLoading(false);
        toast.error("Login timeout. Please try again.");
      });
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(navigationTimeout);
    };
  }, [waitingForAuth, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submission
    if (loading) return;
    
    setLoading(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        console.log("🔐 Login successful, setting up auth listener");
        setWaitingForAuth(true);
      } else {
        // Only show error, don't clear fields
        toast.error(result.error || "Login failed");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

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
                disabled={loading || waitingForAuth}
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
                disabled={loading || waitingForAuth}
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading || waitingForAuth}>
              {loading ? "Signing In..." : waitingForAuth ? "Redirecting..." : "Sign In"}
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
